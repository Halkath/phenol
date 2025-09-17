const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require('discord.js');
const Giveaway = require('../../Schemas.js/giveawaySchema');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Manage giveaways")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName("start")
                .setDescription("Start a new giveaway")
                .addStringOption(option =>
                    option.setName("prize").setDescription("Prize for the giveaway").setRequired(true))
                .addStringOption(option =>
                    option.setName("duration").setDescription("Duration (e.g., 1h, 1d)").setRequired(true))
                .addIntegerOption(option =>
                    option.setName("winners").setDescription("Number of winners").setMinValue(1).setMaxValue(10).setRequired(true))
                .addChannelOption(option =>
                    option.setName("channel").setDescription("Channel to host the giveaway").setRequired(true))
                .addStringOption(option =>
                    option.setName("description").setDescription("Optional description").setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("end")
                .setDescription("End a giveaway early")
                .addStringOption(option =>
                    option.setName("message_id").setDescription("Giveaway message ID").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("reroll")
                .setDescription("Reroll the winner")
                .addStringOption(option =>
                    option.setName("message_id").setDescription("Giveaway message ID").setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === "start") return handleStart(interaction);
        if (sub === "end") return handleEnd(interaction);
        if (sub === "reroll") return handleReroll(interaction);
    }
};

async function handleStart(interaction) {
    const prize = interaction.options.getString("prize");
    const duration = interaction.options.getString("duration");
    const winners = interaction.options.getInteger("winners");
    const channel = interaction.options.getChannel("channel");
    const description = interaction.options.getString("description") || "";

    const durationMs = ms(duration);
    if (!durationMs) {
        return interaction.reply({ content: "Invalid duration format.", ephemeral: true });
    }

    const endTime = new Date(Date.now() + durationMs);

    const giveawayData = {
        prize,
        description,
        winners,
        endTime,
        hosterId: interaction.user.id,
        channelId: channel.id,
        participants: [],
        ended: false
    };

    const embed = createGiveawayEmbed(giveawayData);
    const components = [createGiveawayButtons(0)];

    const sentMessage = await channel.send({ embeds: [embed], components });

    await Giveaway.create({
        ...giveawayData,
        messageId: sentMessage.id
    });

    await interaction.reply({
        content: `🎉 Giveaway started in ${channel}!`,
        ephemeral: true
    });
}

function createGiveawayEmbed({ prize, description, winners, endTime, hosterId, participants }) {
    return new EmbedBuilder()
        .setTitle("🎉 New Giveaway 🎉")
        .setDescription(`**Prize:** ${prize}\n${description ? `**Description:** ${description}\n` : ''}**Winners:** ${winners}\n**Ends:** <t:${Math.floor(endTime.getTime() / 1000)}:R>\n**Hosted by:** <@${hosterId}>\n**Entries:** ${participants.length || 0}`)
        .setColor("Aqua")
        .setTimestamp(endTime);
}

function createGiveawayButtons(count) {
    const enter = new ButtonBuilder()
        .setCustomId("giveaway-enter")
        .setLabel("Enter Giveaway 🎉")
        .setStyle(ButtonStyle.Primary);

    const info = new ButtonBuilder()
        .setCustomId("giveaway-count")
        .setLabel(`${count} Entries`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    return new ActionRowBuilder().addComponents(enter, info);
}

async function handleEnd(interaction) {
    const messageId = interaction.options.getString("message_id");
    const giveaway = await Giveaway.findOne({ messageId });

    if (!giveaway) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
    if (giveaway.ended) return interaction.reply({ content: "This giveaway has already ended.", ephemeral: true });

    await concludeGiveaway(interaction, giveaway, true);
}

async function handleReroll(interaction) {
    const messageId = interaction.options.getString("message_id");
    const giveaway = await Giveaway.findOne({ messageId });

    if (!giveaway) return interaction.reply({ content: "Giveaway not found.", ephemeral: true });
    if (!giveaway.ended) return interaction.reply({ content: "Giveaway has not ended yet.", ephemeral: true });

    const winners = pickWinners(giveaway.participants, giveaway.winners);
    const winnerMentions = winners.map(id => `<@${id}>`).join(", ");
    const channel = await interaction.guild.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    await message.reply({
        content: `🎉 New Winners: ${winnerMentions}`,
        embeds: [
            new EmbedBuilder()
                .setDescription(`🎊 Rerolled winners for **${giveaway.prize}**: ${winnerMentions}`)
                .setColor("Green")
        ]
    });

    await interaction.reply({ content: "Rerolled successfully.", ephemeral: true });
}

async function concludeGiveaway(interaction, giveaway, manual = false) {
    giveaway.ended = true;
    const winners = pickWinners(giveaway.participants, giveaway.winners);
    giveaway.winnerIds = winners;
    await giveaway.save();

    const channel = await interaction.guild.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    const finalEmbed = EmbedBuilder.from(message.embeds[0])
        .setTitle("🎉 Giveaway Ended 🎉")
        .setColor("Red");

    const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ended")
            .setLabel("Giveaway Ended")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );

    await message.edit({ embeds: [finalEmbed], components: [disabledRow] });

    if (winners.length > 0) {
        const winnerMentions = winners.map(id => `<@${id}>`).join(", ");
        await message.reply({
            content: `🎊 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`
        });
    } else {
        await message.reply({
            content: "😢 No valid entries, no winners."
        });
    }

    if (manual) {
        await interaction.reply({ content: "Giveaway ended early.", ephemeral: true });
    }
}

function pickWinners(participants, winnerCount) {
    if (!participants || participants.length === 0) return [];
    const shuffled = participants.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, winnerCount);
}
