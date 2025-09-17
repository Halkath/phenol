const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const permissionsMap = {
  "ADMINISTRATOR": "Administrator",
  "MANAGE_GUILD": "Manage Server",
  "MANAGE_ROLES": "Manage Roles",
  "MANAGE_CHANNELS": "Manage Channels",
  "KICK_MEMBERS": "Kick Members",
  "BAN_MEMBERS": "Ban Members",
  "MANAGE_NICKNAMES": "Manage Nicknames",
  "MANAGE_EMOJIS_AND_STICKERS": "Manage Emojis",
  "MANAGE_WEBHOOKS": "Manage Webhooks",
  "MANAGE_MESSAGES": "Manage Messages",
  "MENTION_EVERYONE": "Mention Everyone"
};

const userFlagsMap = {
  "DISCORD_EMPLOYEE": "<:discord_employee:1026903789262880800>",
  "DISCORD_PARTNER": "<:partners:1026903940685627443>",
  "BUGHUNTER_LEVEL_1": "<:bug_hunter:1026904095895859240>",
  "BUGHUNTER_LEVEL_2": "<:BugHunter2:1026904223234932806>",
  "HYPESQUAD_EVENTS": "<:hypesquad_events:1026904392022102086>",
  "HOUSE_BRILLIANCE": "<:brilliance:1026904485819326595>",
  "HOUSE_BRAVERY": "<:bravery:1026904604660748369>",
  "HOUSE_BALANCE": "<:balance:1026904705890254859>",
  "EARLY_SUPPORTER": "<:EarlySupporter:1026904834663788674>",
  "TEAM_USER": "<:TEAM_USER:1026905011298504855>",
  "VERIFIED_BOT": "<:VerifiedBot:1026905121042477106>",
  "EARLY_VERIFIED_DEVELOPER": "<:BotDeveloper:1026905242618576956>"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to get info about')
        .setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('target') || interaction.member;
    const user = member.user;

    const nickname = member.nickname || 'None';
    const avatar = user.displayAvatarURL({ dynamic: true });
    const userFlags = (await user.fetchFlags()).toArray();
    const permissions = member.permissions.toArray();
    const filteredPerms = Object.entries(permissionsMap)
      .filter(([perm]) => permissions.includes(perm))
      .map(([_, label]) => label);

    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .join(' ') || '`No roles`';

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.username}'s Information`, iconURL: avatar })
      .setThumbnail(avatar)
      .addFields(
        {
          name: 'General Information',
          value: `Username: \`${user.username}\`\nDiscriminator: \`#${user.discriminator}\`\nNickname: \`${nickname}\``,
          inline: false
        },
        {
          name: 'Overview',
          value: `Badges: ${userFlags.length ? userFlags.map(flag => userFlagsMap[flag]).join(' ') : 'None'}\nType: ${user.bot ? 'Bot' : 'Human'}`,
          inline: false
        },
        {
          name: 'Server Relating Information',
          value: `Roles: ${roles}\nKey Permissions: \`${filteredPerms.join(', ') || 'None'}\``,
          inline: false
        },
        {
          name: 'Misc Information',
          value: `Created On: <t:${Math.floor(user.createdTimestamp / 1000)}:R>\nJoined On: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
          inline: false
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor('Blurple');

    return interaction.reply({ embeds: [embed] });
  }
};

