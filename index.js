// ──────────────────────────────────────────────────────────────────────────────
// Main Bot File – Discord.js v14 (No Giveaways, Ping-Reply Added)
// ──────────────────────────────────────────────────────────────────────────────
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  Events,
    AuditLogEvent,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Partials,
    TextInputBuilder, 
    TextInputStyle,
    ModalBuilder
} = require('discord.js');
const fs = require('fs');
const { createTranscript } = require('discord-html-transcripts');
require('dotenv').config();

// ── Client & Collections ───────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Reaction,
    Partials.Channel
  ]
});


client.commands = new Collection();
client.prefix = new Map();
client.color = '#2f3136';
client.emoji = {
  'tick': '<:sinux_correct:1348307382043938857>',
  'cross': '<:Sinux_wrong:1274571568529412159>',
  'dot': '<:Sinux_arrow:1274574170960953449>',
  'giveaway': '<:Sinux_Giveaway:1336361170172379228>',
  'arrow': '<a:sinux_a1:1333008625987358791>'
};
// ── Dynamic Handler Loading ────────────────────────────────────────────────────
const functions = fs.readdirSync("./src/functions").filter(f => f.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(f => f.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");
const prefixFiles = fs.readdirSync("./src/prefix").filter(f => f.endsWith(".js"));

// Load prefix commands
for (const file of prefixFiles) {
  const Cmd = require(`./prefix/${file}`);
  client.prefix.set(Cmd.name, Cmd);
}

// Initialise handlers & login
(async () => {
  for (const file of functions) require(`./functions/${file}`)(client);
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.token);
})();

client.on('guildDelete', guild => {
  client.channels.fetch('1085787808368709712')
    .then(channel => channel.send({ content: `Bot was kicked out from ${guild.name} (${guild.id})` }))
    .catch(() => console.log('could send message to logs channel'));
})

client.on("guildCreate", async (guild) => {
  try {
    const channel = await client.channels.fetch("1085787808368709712");
    if (channel && channel.isTextBased()) {
      await channel.send({ content: `✅ Bot joined **${guild.name}** (${guild.id})` });
    }
  } catch (err) {
    console.log("❌ Could not send message to logs channel:", err.message);
  }
});

// ── Schemas ────────────────────────────────────────────────────────────────────
const autoSchema = require('./Schemas.js/autoresponder');
const reactionSchema = require('./Schemas.js/reactionroleSchema');
const ticketSchema = require('./Schemas.js/ticketSchema');
const joinrole = require('./Schemas.js/autoroleSchema');
const afkSchema = require('./Schemas.js/afkSchema');
const noPrefixSchema = require('./Schemas.js/noPrefixSchema');
const joinSchema = require("./Schemas.js/jointocreate");
const joinchannelSchema = require('./Schemas.js/jointocreatechannel');
// ── messageCreate Handler (prefix cmds, autoresponder, ping-reply) ─────────────
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  // 1) Ping-reply embed
 if (
  message.content === `<@${client.user.id}>` ||
  message.content === `<@!${client.user.id}>`
) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Invite Me')
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`
      )
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel('Support Server')
      .setURL('https://discord.gg/dater') // ⬅️ replace with your invite
      .setStyle(ButtonStyle.Link)
  );

  const pingEmbed = new EmbedBuilder()
    .setColor(client.color)
    .setTitle(
      `<a:Sinux_dholak:1121786799354814566> __**Heyy! I am ${client.user.username}**__`
    )
    .setDescription(
      `**Find Commands by \`/help\`**
    
<:sinux_settings:1382306178251358259>** My prefix is: \`?\`
<:Sinux_User:1275090870429024331> I'm a Private Official Server Bot.**`
    );

  return message.channel.send({
    content: `**Hey! <@${message.author.id}>**`,
    embeds: [pingEmbed],
    components: [row],
  });
}

  // 3) No Prefix handling
  if (message.author.bot) return;
  const noPrefixUser = await noPrefixSchema.findOne({ userId: message.author.id });
  let command, args;
  if (noPrefixUser) {
    const messageArray = message.content.trim().split(/ +/);
    command = messageArray.shift().toLowerCase();
    args = messageArray;
  } else {
    const prefix = '?';
    if (!message.content.startsWith(prefix)) return;
    args = message.content.slice(prefix.length).trim().split(/ +/);
    command = args.shift()?.toLowerCase();
  }
  const prefixcmd = client.prefix.get(command) || Array.from(client.prefix.values()).find(cmd => cmd.aliases && cmd.aliases.includes(command));
  if (prefixcmd) {
    try {
      prefixcmd.run(client, message, args);
    } catch (err) {
      console.error("Prefix Command Error:", err);
    }
  }

  // 3) Auto-responder
  try {
    const autoData = await autoSchema.findOne({ guildId: message.guild.id });
    if (autoData?.autoresponses?.length) {
      for (const d of autoData.autoresponses) {
        if (message.content.toLowerCase() === d.trigger.toLowerCase()) {
          return message.reply(d.response);
        }
      }
    }
  } catch (err) {
    console.error("AutoResponder Error:", err);
  }
});

// ── Reaction Roles ─────────────────────────────────────────────────────────────
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot || !reaction.message.guildId) return;

  const emojiId = reaction.emoji.id
    ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const data = await reactionSchema.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: emojiId
  });
  if (!data) return;

  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);
  if (!member || member.roles.cache.has(data.Role)) return;

  try {
    await member.roles.add(data.Role);
    await user.send({
      content: `✅ You received the role <@&${data.Role}> by reacting with ${reaction.emoji.name}.`
    });
  } catch (err) {
    console.error("Failed to add role or send DM:", err.message);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot || !reaction.message.guildId) return;

  const emojiId = reaction.emoji.id
    ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const data = await reactionSchema.findOne({
    Guild: reaction.message.guildId,
    Message: reaction.message.id,
    Emoji: emojiId
  });
  if (!data) return;

  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);
  if (!member) return;

  try {
    await member.roles.remove(data.Role);
  } catch (err) {
    console.error("Failed to remove role:", err.message);
  }
});

// ── Ticket System Buttons ──────────────────────────────────────────────────────

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, guild, channel, user, member } = interaction;
  const data = await ticketSchema.findOne({ GuildId: guild.id });
  if (!data) return;

  const supportRole = guild.roles.cache.get(data.Role);

  if (customId === 'ticket') {
    const existing = guild.channels.cache.find(c =>
      c.topic && c.topic.includes(`Ticket Owner : ${user.id}`)
    ); 

    if (existing) {
      return interaction.reply({
        content: `You already have a ticket open: <#${existing.id}>`,
        ephemeral: true,
      });
    }

    const createdChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      parent: data.Category,
      type: ChannelType.GuildText,
      topic: `Ticket Owner : ${user.id}`,
      permissionOverwrites: [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: supportRole.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        { id: user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      ]
    });

    const openEmbed = new EmbedBuilder()
      .setColor('#00c7fe')
      .setTitle('Ticket Opened')
      .setDescription(`Welcome **${user.username}**\n\nClick 🔒 to close the ticket.`)
      .setThumbnail(guild.iconURL())
      .setFooter({ text: `${guild.name}'s Tickets` });

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('closeticket')
        .setLabel('Close')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary)
    );

    await createdChannel.send({
      content: ` || <@&${supportRole.id}> || | Ticket Created`,
      embeds: [openEmbed],
      components: [closeButton]
    });

    return interaction.reply({
      embeds: [new EmbedBuilder().setDescription(`🎟️ Ticket Created in <#${createdChannel.id}>`).setColor(client.color)],
      ephemeral: true
    });
  }

  if (customId === 'closeticket') {
    const confirmEmbed = new EmbedBuilder()
      .setDescription(`Are you sure you want to close this ticket?`)
      .setColor("#ffcc00");

    const confirmButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('yesclose').setLabel('Yes').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('nodont').setLabel('No').setStyle(ButtonStyle.Success)
    );

    return interaction.reply({ embeds: [confirmEmbed], components: [confirmButtons], ephemeral: true });
  }
     const ownerId = channel.topic?.split(': ')[1];
let ownerName = "unknown";
  if (ownerId) {
    const owner = await guild.members.fetch(ownerId).catch(() => null);
    if (owner) ownerName = owner.user.username;
  }
  if (customId === 'yesclose') {
    await channel.permissionOverwrites.edit(user.id, { ViewChannel:  false });

    const closedEmbed = new EmbedBuilder()
      .setTitle("Ticket Closed")
      .setDescription(`Ticket **${channel.name}** has been closed.\nOnly staff can view this now.\nUse buttons to reopen, delete, create a transcript.`)
      .setColor('Red');

    const closeActions = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('deleteticket').setLabel('Delete').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('reopenticket').setLabel('Reopen').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('transcriptticket').setLabel('Transcript').setStyle(ButtonStyle.Primary)
    );

    const confirmdisableButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('yesclose').setLabel('Yes').setStyle(ButtonStyle.Danger).setDisabled(true),
      new ButtonBuilder().setCustomId('nodont').setLabel('No').setStyle(ButtonStyle.Success).setDisabled(true)
    );
       await channel.edit({ name: `closed-${ownerName}` });
    return interaction.reply({ embeds: [closedEmbed], components: [closeActions] });
  }

  if (customId === 'reopenticket') {
    if (!member.roles.cache.has(data.Role)) {
      return interaction.reply({
        content: "❌ Only support staff can reopen tickets.",
        ephemeral: true
      });
    }
    await channel.edit({ name: `reopen-${ownerName}` });
    const ownerMember = await guild.members.fetch(ownerId).catch(() => null);
      // ✅ DM the ticket owner
      ownerMember.send({
        content: ` Hello ${ownerMember}, your ticket has been **re-opened by staff**. Please check it asap.`
      }).catch(() => {
        console.log(`❌ Could not DM ${ownerMember.user.tag}`);
      });
    
    //const ownerId = channel.topic?.split(': ')[1];
    if (ownerId) {
      await channel.permissionOverwrites.edit(ownerId, { ViewChannel: true, SendMessages: true });
    }

    await interaction.reply({
      embeds: [new EmbedBuilder().setDescription(`${client.emoji.tick} | Ticket has been reopened.`).setColor('Green')],
    });
  }

  if (customId === 'transcriptticket') {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`⏳ Generating transcript...`)
          .setColor('Orange')
      ],
      ephemeral: true
    });

    const ownerId = channel.topic?.split(': ')[1];
    const transcript = await createTranscript(channel, {
      limit: -1,
      returnBuffer: false,
      fileName: `ticket-${channel.name}.html`
    });

    const transcriptEmbed = new EmbedBuilder()
      .setAuthor({ name: `${guild.name} Ticket Transcript`, iconURL: guild.iconURL() })
      .addFields(
        { name: 'Ticket Channel', value: `#${channel.name}`, inline: true },
        { name: 'Opened By', value: `<@${ownerId}>`, inline: true },
        { name: 'Closed By', value: `<@${user.id}>`, inline: true }
      )
      .setColor(client.color)
      .setTimestamp()
      .setFooter({ text: `${guild.name} Ticket Logs` });

    const logsChannel = guild.channels.cache.get(data.Logs);
    if (logsChannel) {
      try {
        await logsChannel.send({
          embeds: [transcriptEmbed],
          files: [transcript]
        });
      } catch (err) {
        console.log(`❌ Failed to send transcript to logs:`, err);
      }
    }

    return interaction.followUp({
      content: `📄 Transcript has been generated and sent to logs.`,
      ephemeral: true
    });
  }

  if (customId === 'deleteticket') {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`⏳ Deleting ticket in 10 seconds...`)
          .setColor(client.color)
      ],
      ephemeral: false
    });

    setTimeout(() => {
      channel.delete().catch(() => null);
    }, 10000);
  }

  if (customId === 'nodont') {
    const cancelEmbed = new EmbedBuilder()
      .setDescription(`❌ Ticket close cancelled.`)
      .setColor('Red');

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('disabled_yes').setLabel('Yes').setDisabled(true).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('disabled_no').setLabel('No').setDisabled(true).setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [cancelEmbed], components: [disabledRow] });
  }
});




// ── AFK System ────────────────────────────────────────────────────────────────
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  // Remove AFK if author was AFK
  const authorData = await afkSchema.findOne({
    Guild: message.guild.id,
    User: message.author.id
  });

  if (authorData) {
    await afkSchema.deleteOne({ Guild: message.guild.id, User: message.author.id });
    await message.reply(`Welcome back, ${message.author}, I’ve removed your AFK status.`);
  }

  // Mention checks
  for (const [, user] of message.mentions.users) {
    const afkData = await afkSchema.findOne({ Guild: message.guild.id, User: user.id });
    if (!afkData) continue;

    const member = message.guild.members.cache.get(user.id);
    const reason = afkData.Message || "I'm AFK";
    const afkEmbed = new EmbedBuilder()
      .setDescription(`${member.user.tag} is currently AFK\n**Reason:** ${reason}`)
      .setColor('Random')
      .setFooter({ text: 'Made by Sinux Development' })
      .setTimestamp();

    await message.reply({ content: `${message.author}`, embeds: [afkEmbed] });
  }
});




// ──────────────────────────────────────────────────────────────────────────────
// Embed Builder
// ──────────────────────────────────────────────────────────────────────────────


client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'modal') {
    const title = interaction.fields.getTextInputValue('title')?.trim();
    const description = interaction.fields.getTextInputValue('description')?.trim();
    const color = interaction.fields.getTextInputValue('color')?.trim() || '#000000';
    const image = interaction.fields.getTextInputValue('image_link')?.trim();
    const thumbnail = interaction.fields.getTextInputValue('thumbnail')?.trim();

    // ✅ Validate required fields
    if (!title || !description) {
      return interaction.reply({
        content: `❌ Title and Description are required and cannot be empty.`,
        ephemeral: true
      });
    }

    // ✅ Optional: Validate color format
    const colorRegex = /^#([0-9A-Fa-f]{6})$/;
    if (color && !colorRegex.test(color)) {
      return interaction.reply({
        content: `❌ Invalid color format. Please use hex format like \`#00ffff\`.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color);

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    await interaction.channel.send({ embeds: [embed] });

    await interaction.reply({
      content: `✅ Embed sent successfully!`,
      ephemeral: true
    });
  }
});

// ── Join to create System ────────────────────────────────────────────────────────────────
// CREATE VC WHEN MEMBER JOINS THE JOIN CHANNEL
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
        // Ignore bots
        if (newState.member.user.bot) return;
        if (!newState.guild) return;

        const joindata = await joinSchema.findOne({ Guild: newState.guild.id });
        if (!joindata) return;

        const joinchanneldata = await joinchannelSchema.findOne({
            Guild: newState.guild.id,
            User: newState.member.id
        });

        const voicechannel = newState.channel;
        if (!voicechannel) return;

        // Joined the specific "Join to Create" channel
        if (voicechannel.id === joindata.Channel) {
            if (joinchanneldata) {
                try {
                    await newState.member.send({
                        content: "You already have a voice channel."
                    });
                } catch (err) {}
                return;
            }

            // Create a personal VC
            const channel = await newState.guild.channels.create({
                type: ChannelType.GuildVoice,
                name: `${newState.member.user.username}'s Room`,
                userLimit: joindata.VoiceLimit || 0,
                parent: joindata.Category || null
            });

            try {
                await newState.member.voice.setChannel(channel.id);
            } catch (err) {}

            // Save channel info in DB
            await joinchannelSchema.create({
                Guild: newState.guild.id,
                Channel: channel.id,
                User: newState.member.id
            });

            try {
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription(`✅ Your personal voice channel has been created: **${channel.name}**`);

                await newState.member.send({ embeds: [embed] });
            } catch (err) {}
        }
    } catch (err) {
        console.error(err);
    }
});

// DELETE VC WHEN MEMBER LEAVES IT
// DELETE VC WHEN EMPTY
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
        if (!oldState.guild) return;

        // Only check if the user left a voice channel
        if (!oldState.channelId) return;

        const leavechanneldata = await joinchannelSchema.findOne({
            Guild: oldState.guild.id,
            Channel: oldState.channelId
        });
        if (!leavechanneldata) return;

        const voicechannel = oldState.guild.channels.cache.get(leavechanneldata.Channel);
        if (!voicechannel) return;

        // If channel has no members, delete it
        if (voicechannel.members.size === 0) {
            await voicechannel.delete().catch(() => {});
            await joinchannelSchema.deleteOne({
                Guild: oldState.guild.id,
                Channel: oldState.channelId
            });

            try {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`🗑️ Your personal voice channel has been deleted.`);

                const owner = oldState.guild.members.cache.get(leavechanneldata.User);
                if (owner) await owner.send({ embeds: [embed] }).catch(() => {});
            } catch (err) {}
        }
    } catch (err) {
        console.error(err);
    }
});

//help 
//const { EmbedBuilder } = require('discord.js');

client.on("interactionCreate", async (interaction) => {
  // Handle the String Select Menu with customId "help-menu"
  if (interaction.isStringSelectMenu() && interaction.customId === "help-menu") {
    let embed;
    switch (interaction.values[0]) {
      case "fun":
        embed = new EmbedBuilder()
          .setTitle(" Fun Commands")
          .setDescription("`ascii`, `rockpaperscissor`, `tictactoe`")
          .setColor("#2f3136");
        break;
      case "image":
        embed = new EmbedBuilder()
          .setTitle("Image Commands")
          .setDescription("**Adding In the Bot Soon ...**")
          .setColor("#2f3136");
        break;
      case "info":
        embed = new EmbedBuilder()
          .setTitle(" Information Commands")
          .setDescription("`avatar`, `banner`, `userinfo`, `roleinfo`, `ping`, `uptime`,`steal`,`purge`")
          .setColor("#2f3136");
        break;
      case "mod":
        embed = new EmbedBuilder()
          .setTitle(" Moderation Commands")
          .setDescription("`ban`, `kick`, `mute`, `nuke`, `purge`, `lock`, `unlock`, `hide`,`unhide`,`nuke`.")
          .setColor("#2f3136");
        break;
      case "vc":
        embed = new EmbedBuilder()
          .setTitle(" Voice Commands")
          .setDescription("`vcdeafen`, `vcmute`, `vcunmute`, `vckick`, `vclist`,`vclock`,`vcunlock`,`vchide`,`vcunhide`")
          .setColor("#2f3136");
        break;
    }
    await interaction.update({ embeds: [embed] });
    return;
  }

  // Handle Button interaction - home button
  if (interaction.isButton()) {
    if (interaction.customId === "home") {
      const homeEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.client.user.username} - Help Menu!`,
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setDescription(
          `Hey there! I'm **${interaction.client.user.username}**, your multipurpose bot.\nYou can use \`?help \` to get more info on a command.\n\n` +
          `**Categories**\n` +
          `<a:sinux_enjoy:1391320953350258739> : Fun\n` +
          `<:sinux_pyaar:1406673556959662110> : Image\n` +
          `<a:Sinux_Commandlist:1113128938785493124> : Information\n` +
          `<a:Sinux_Staff:1135249594830311495> : Moderation\n` +
          `<:sinux_vc_vibe:1407252226409238613> : Voice\n\n` +
          `[Invite](https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands) | [Support Server](https://discord.gg/dater)`
        )
        .setImage("https://media.discordapp.net/attachments/1062219555453288489/1065637201339236503/20230119_195122.jpg")
        .setColor("#2f3136");
      await interaction.update({ embeds: [homeEmbed] });
      return;
    }
  }
});

//join roles
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const data = await joinrole.findOne({ GuildId: member.guild.id });
    if (!data?.RoleIds?.length) return;

    const rolesToAdd = data.RoleIds
      .map(id => member.guild.roles.cache.get(id))
      .filter(Boolean);

    for (const role of rolesToAdd) {
      await member.roles.add(role, 'Given due to role in autorole')
        .catch(err => console.error(`Failed to add role ${role.id}:`, err));
    }
  } catch (err) {
    console.error('Autorole Error:', err);
  }
});
//temp vc interaction buttons client.on(Events.InteractionCreate, async (interaction) => {
// const { Events, ChannelType, EmbedBuilder } = require('discord.js');

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle temp VC button interactions
  const tempVcIds = ['lockv', 'unlockv', 'hidev', 'unhidev', 'limitv'];
  try {
    if (interaction.isButton() && tempVcIds.includes(interaction.customId)) {
      const { customId, guild, member } = interaction;
      // Use voice channel from options OR member's current voice channel
      let channel = interaction.options?.getChannel?.('channel') || member.voice.channel;
      if (!channel || channel.type !== ChannelType.GuildVoice) {
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.cross} | Please mention a valid voice channel or join one.`)
          ],
          ephemeral: true
        });
        return;
      }
      if (customId === "lockv") {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: false });
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.tick} | Locked **${channel.name}**\n\n**__Use \`?vcunlock\` to Unlock Your Voice Channel__**`)
          ],
          ephemeral: true
        });
      } else if (customId === "unlockv") {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: true });
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.tick} | Unlocked **${channel.name}**\n\n${client.emoji.arrow} **__Use \`?vclock\` To Lock Your Voice Channel__**`)
          ],
          ephemeral: true
        });
      } else if (customId === "hidev") {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.tick} | Hidden **${channel.name}**\n\n**__Use \`?vcunhide\` to Unhide Your Voice Channel__**`)
          ],
          ephemeral: true
        });
      } else if (customId === "unhidev") {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: true });
        await interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.tick} | Unhidden **${channel.name}**\n\n**__Use \`?vchide\` to Hide Your Voice Channel__**`)
          ],
          ephemeral: true
        });
      } else if (customId === "limitv") {
        // Show a modal to set voice channel user limit
        const modal = new ModalBuilder()
          .setCustomId('limitvModal')
          .setTitle('Set Voice Channel Limit');
        const limitInput = new TextInputBuilder()
          .setCustomId('limitInput')
          .setLabel('Enter new voice channel user limit (2-20)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. 10')
          .setRequired(true);
        const actionRow = new ActionRowBuilder().addComponents(limitInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);
      }
    } 
    // Handle temp VC user limit modal
    else if (interaction.isModalSubmit() && interaction.customId === 'limitvModal') {
      const newLimit = interaction.fields.getTextInputValue('limitInput');
      const limitNum = parseInt(newLimit, 10);
      if (isNaN(limitNum) || limitNum < 2 || limitNum > 20) {
        return interaction.reply({ 
          content: `${client.emoji.cross} | Please enter a valid number between 2 and 20.`, 
          ephemeral: true 
        });
      }
      const member = interaction.member;
      const channel = member.voice.channel;
      if (!channel || channel.type !== ChannelType.GuildVoice) {
        return interaction.reply({
          content: client.emoji.cross + ' | You must be in a voice channel to set the limit.',
          ephemeral: true
        });
      }
      await channel.setUserLimit(limitNum);
      await interaction.reply({
        content: `Voice channel user limit updated to __${limitNum}__\n${client.emoji.arrow} Channel Name : \`${channel.name}\`!`,
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling temp VC permissions:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'An error occurred while modifying the voice channel permissions.',
        ephemeral: true
      });
    }
  }
});

//const antinuke = require('./Schemas.js/antinukeSchema');
const antinukeSchema = require('./Schemas.js/antinukeSchema');
let lastExecuterId = null;

async function sendAntinukeLog(guild, embed) {
  try {
    const data = await antinukeSchema.findOne({ guildId: guild.id });
    if (!data.logChannelId) return;

    const logChannel = guild.channels.cache.get(data.logChannelId);
    if (!logChannel) return;

    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    console.error("Log sending failed:", err);
  }
}
// Anti Kick (re-add kicked member)
client.on(Events.GuildMemberRemove, async (member) => {
  const guild = member.guild;
  const auditLogs = await guild.fetchAuditLogs({
    type: AuditLogEvent.MemberKick,
    limit: 1,
  });
    const antinukeData = await antinukeSchema.findOne({ guildId: guild.id });
  if (!antinukeData) return;
  const kickLog = auditLogs.entries.first();
  if (!kickLog) return;

  const { executor, target } = kickLog;
  try {
    if (executor && executor.id !== lastExecuterId) {
      const antinukeEntry = await antinukeSchema.findOne({
        guildId: guild.id,
        whitelist: executor.id,
      });
      if (!antinukeEntry) {
        await guild.members.ban(executor.id, {
          reason: `User is not whitelisted`,
        });

        // revert: try to reinvite the kicked member
        try {
          await guild.members.unban(target.id).catch(() => {}); // just in case they got banned
          await guild.invites.create(guild.systemChannelId || guild.channels.cache.filter(c => c.isTextBased()).first()?.id, {
            maxUses: 1,
            maxAge: 0,
            reason: "Re-invite kicked member (antinuke revert)",
          }).then(invite => {
            target.send(`You were kicked but protected by antinuke. Here’s your invite back: ${invite.url}`).catch(() => {});
          }).catch(() => {});
        } catch (err) {
          console.error("Failed to revert kick:", err);
        }

        const executorTag = executor?.tag || 'Unknown User';
        const punishmentDetails = 'User has been banned from this server. User was not whitelisted';
        const punishmentReason = `User ${executorTag} attempted to kick a server member.`;

        const serverOwner = await guild.fetchOwner();
        const embedMessage = new EmbedBuilder()
          .setTitle("User Banned")
          .setDescription(`Server Owner : ${serverOwner.user.tag}`)
          .addFields(
            { name: `Punishment Reason : `, value: punishmentReason, inline: true },
            { name: `Punishment Details : `, value: punishmentDetails, inline: true },
            { name: `Executor : `, value: executorTag, inline: true },
          )
          .setTimestamp();

        serverOwner.send({ embeds: [embedMessage] });
await sendAntinukeLog(guild, embedMessage);
        lastExecuterId = executor.id;
      }
    }
  } catch (error) {
    console.error('Error processing Action', error);
  }
});

// Anti Unban (re-ban the member)
client.on(Events.GuildBanRemove, async (ban) => {
  const guild = ban.guild;
    const antinukeData = await antinukeSchema.findOne({ guildId: guild.id });
  if (!antinukeData) return;
  const auditLogs = await guild.fetchAuditLogs({
    type: AuditLogEvent.GuildBanRemove,
    limit: 1,
  });
  const GuildRemoveLog = auditLogs.entries.first();
  if (!GuildRemoveLog) return;

  const { executor, target } = GuildRemoveLog;
  try {
    const antinukeEntry = await antinukeSchema.findOne({
      guildId: guild.id,
      whitelist: executor.id,
    });
    if (!antinukeEntry) {
      await guild.members.ban(executor.id, {
        reason: `User is not whitelisted`,
      });

      // revert: re-ban the unbanned user
      await guild.members.ban(target.id, {
        reason: "Reverting unauthorized unban (antinuke)",
      }).catch(() => {});

      const executorTag = executor?.tag || 'Unknown User';
      const punishmentDetails = 'User has been banned from this server. User was not whitelisted';
      const punishmentReason = `User ${executorTag} attempted to unban a member.`;

      const serverOwner = await guild.fetchOwner();
      const embedMessage = new EmbedBuilder()
        .setTitle("User Banned")
        .setDescription(`Server Owner : ${serverOwner.user.tag}`)
        .addFields(
          { name: `Punishment Reason : `, value: punishmentReason, inline: true },
          { name: `Punishment Details : `, value: punishmentDetails, inline: true },
          { name: `Executor : `, value: executorTag, inline: true },
        )
        .setTimestamp();

      serverOwner.send({ embeds: [embedMessage] });
        await sendAntinukeLog(guild, embedMessage);
    }
  } catch (error) {
    console.error('Error processing Action', error);
  }
});
/*
// Anti Role Update (revert role changes)
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const guild = oldMember.guild;
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
const antinukeData = await antinukeSchema.findOne({ guildId: guild.id });
  if (!antinukeData) return;
  if (addedRoles.size > 0 || removedRoles.size > 0) {
    try {
      const auditLogs = await guild.fetchAuditLogs({
        type: AuditLogEvent.MemberRoleUpdate,
        limit: 1,
      });
      const roleUpdateLog = auditLogs.entries.first();

      if (roleUpdateLog && roleUpdateLog.target.id === newMember.id) {
       const executor = await guild.members.fetch(roleUpdateLog.executorId).catch(() => null);
  if (!executor) return;

  // skip safe executors
  if (executor.id === guild.ownerId) return;
  if (executor.user.bot && executor.id === guild.client.user.id) return;
  if (executor.user.system) return;

  // skip onboarding / managed role changes
  const isOnboardingRole = [...addedRoles.values(), ...removedRoles.values()]
    .some(r => r.managed || r.tags?.botId || r.tags?.integrationId);
  if (isOnboardingRole) return;

          
        const antinukeEntry = await antinukeSchema.findOne({
          guildId: guild.id,
          whitelist: executor.id,
        });
        if (!antinukeEntry) {
          await guild.members.ban(executor.id, {
            reason: `User not Whitelisted`,
          });

          // revert: restore old roles
          const rolesToAddBack = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
          const rolesToRemove = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));

          for (const role of rolesToAddBack.values()) {
            await newMember.roles.add(role).catch(() => {});
          }
          for (const role of rolesToRemove.values()) {
            await newMember.roles.remove(role).catch(() => {});
          }

          const executorTag = executor.user?.tag || 'Unknown User';
          const punishmentDetails = 'User has been banned from this server. User was not whitelisted';
          const punishmentReason = `User ${executorTag} attempted to update member roles.`;

          const serverOwner = await guild.fetchOwner();

          const embedMessage = new EmbedBuilder()
            .setTitle("User Banned")
            .setDescription(`Server Owner : ${serverOwner.user.tag}`)
            .addFields(
              { name: `Punishment Reason : `, value: punishmentReason, inline: true },
              { name: `Punishment Details : `, value: punishmentDetails, inline: true },
              { name: `Executor : `, value: executorTag, inline: true },
            )
            .setTimestamp();

          serverOwner.send({ embeds: [embedMessage] });
          await sendAntinukeLog(guild, embedMessage);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
});*/

// Anti Channel Delete// Anti Channel Create
client.on(Events.ChannelCreate, async (channel) => {
  const guild = channel.guild;

  const auditLogs = await guild.fetchAuditLogs({
    type: AuditLogEvent.ChannelCreate,
    limit: 1,
  });
const antinukeData = await antinukeSchema.findOne({ guildId: guild.id });
  if (!antinukeData) return;
  const GuildRemoveLog = auditLogs.entries.first();
  if (!GuildRemoveLog) return;

  const { executor } = GuildRemoveLog;

  try {
    const antinukeEntry = await antinukeSchema.findOne({
      guildId: guild.id,
      whitelist: executor.id,
    });

    if (!antinukeEntry) {
      // ban the executor
      await guild.members.ban(executor.id, {
        reason: `User is not whitelisted`,
      });

      // revert: delete the created channel
      await channel.delete(`Unauthorized channel creation by ${executor.tag}`);
    }

    const executorTag = executor?.tag || 'Unknown User';
    const punishmentDetails =
      'User has been banned from this server. User was not whitelisted';
    const punishmentReason = executor
      ? `User ${executorTag} attempted to create a channel`
      : `An unidentified user attempted to create a channel`;

    const serverOwner = await guild.fetchOwner();

    const embedMessage = new EmbedBuilder()
      .setTitle('User Banned')
      .setDescription(`Server Owner : ${serverOwner.user.tag}`)
      .addFields(
        { name: `Punishment Reason : `, value: punishmentReason, inline: true },
        { name: `Punishment Details : `, value: punishmentDetails, inline: true },
        { name: `Executor : `, value: executorTag, inline: true }
      )
      .setTimestamp();

    serverOwner.send({ embeds: [embedMessage] });
      await sendAntinukeLog(guild, embedMessage);
  } catch (err) {
    console.error(err);
  }
});

// Anti Channel Delete
client.on(Events.ChannelDelete, async (channel) => {
  const guild = channel.guild;

  const auditLogs = await guild.fetchAuditLogs({
    type: AuditLogEvent.ChannelDelete,
    limit: 1,
  });
const antinukeData = await antinukeSchema.findOne({ guildId: guild.id });
  if (!antinukeData) return;
  const GuildRemoveLog = auditLogs.entries.first();
  if (!GuildRemoveLog) return;

  const { executor } = GuildRemoveLog;

  try {
    const antinukeEntry = await antinukeSchema.findOne({
      guildId: guild.id,
      whitelist: executor.id,
    });

    if (!antinukeEntry) {
      // ban the executor
      await guild.members.ban(executor.id, {
        reason: `User is not whitelisted`,
      });

      // revert: recreate the deleted channel
      await guild.channels.create({
        name: channel.name,
        type: channel.type,
        parent: channel.parentId || null,
        topic: channel.topic || null,
        nsfw: channel.nsfw,
        rateLimitPerUser: channel.rateLimitPerUser || 0,
        reason: `Restoring deleted channel after unauthorized deletion by ${executor.tag}`,
      });
    }

    const executorTag = executor?.tag || 'Unknown User';
    const punishmentDetails =
      'User has been banned from this server. User was not whitelisted';
    const punishmentReason = executor
      ? `User ${executorTag} attempted to delete a channel`
      : `An unidentified user attempted to delete a channel`;

    const serverOwner = await guild.fetchOwner();

    const embedMessage = new EmbedBuilder()
      .setTitle('User Banned')
      .setDescription(`Server Owner : ${serverOwner.user.tag}`)
      .addFields(
        { name: `Punishment Reason : `, value: punishmentReason, inline: true },
        { name: `Punishment Details : `, value: punishmentDetails, inline: true },
        { name: `Executor : `, value: executorTag, inline: true }
      )
      .setTimestamp();

    serverOwner.send({ embeds: [embedMessage] });
      await sendAntinukeLog(guild, embedMessage);
  } catch (err) {
    console.error(err);
  }
});

//Logs System 
const Logs = require("discord-logs");
proccess.on('unhandledRejection', (reason,promise) =>{
  console.group("unhandled Rejection at:",promise, "reasson: ", reason)
});

proccess.on('uncaughtException', (err) => {
  console.log('Uncaught Execption : ', err);
})
Logs(client,{
  debug: true
})
const {handleLogs} = require("./events/handleLogs");
