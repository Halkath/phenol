const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder
} = require('discord.js');
const ticketSchema = require('../../Schemas.js/ticketSchema');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transcript')
        .setDescription('Close a ticket and send transcript to specified user')
        .addUserOption(option =>
            option.setName('sendto')
                .setDescription('User to send the transcript to')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction,client) {
        const { channel, guild, member, user: closedBy } = interaction;
        const sendTo = interaction.options.getUser('sendto');

        const data = await ticketSchema.findOne({ GuildId: guild.id });
        if (!data) {
            return interaction.reply({ content: '<:Sinux_wrong:1274571568529412159> | Ticket system not set up.', ephemeral: true });
        }

        // Must be a support member
        if (!member.roles.cache.has(data.Role)) {
            return interaction.reply({ content: '<:Sinux_wrong:1274571568529412159> | You must be support staff to use this.', ephemeral: true });
        }

        // Check if it's a valid ticket
        const topic = channel.topic;
        if (!topic || !topic.startsWith('Ticket Owner :')) {
            return interaction.reply({ content: '<:Sinux_wrong:1274571568529412159> | This is not a valid ticket channel.', ephemeral: true });
        }

        const ownerId = topic.split(': ')[1];

        // Remove owner's access
        // await channel.permissionOverwrites.edit(ownerId, { ViewChannel: false });

        await interaction.reply({
            embeds: [new EmbedBuilder().setDescription(`🔒 Ticket transcript created.\n${client.emoji.arrow} Transcript will be sent.`).setColor(client.color)]
        });

        // Create transcript
        const transcript = await createTranscript(channel, {
            limit: -1,
            returnBuffer: false,
            fileName: `ticket-${channel.name}.html`
        });

        const transcriptEmbed = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Ticket Transcript`, iconURL: guild.iconURL() })
            .addFields(
                { name: 'Channel Name', value: `${channel.name}`, inline: true },
                { name: 'Opened By', value: `<@${ownerId}>`, inline: true },
                { name: 'Closed By', value: `${closedBy.tag}`, inline: true }
            )
            .setColor(client.color)
            .setTimestamp()
            .setFooter({ text: `${guild.name} Ticket Logs` });

        // Send transcript to selected user
       
    }
};
