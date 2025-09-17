const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const client = require('../../index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Music System")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Search a specific song")
                .setRequired(true)
        ),

    async execute(interaction) {
        const no = "❌"; // Define the "no" emoji or string

        const baseEmbed = new EmbedBuilder()
            .setColor(0xff5555) // Use a red color or any hex
            .setFooter({ text: `Made By Sinux Development` });

        try {
            const query = interaction.options.getString('query');
            const { channel } = interaction.member.voice;

            if (!channel) {
                return interaction.reply({
                    embeds: [baseEmbed.setDescription(`${no} **| Join a voice channel to use this command**`)],
                    ephemeral: true
                });
            }

            if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.Connect)) {
                return interaction.reply({
                    embeds: [baseEmbed.setDescription(`${no} | Missing \`Connect\` permission`)],
                    ephemeral: true
                });
            }

            await interaction.reply({ content: `🔍 Searching...` });

            const player = await client.manager.createPlayer({
                guildId: interaction.guild.id,
                textId: interaction.channel.id,
                voiceId: channel.id,
                volume: 100,
                deaf: true
            });

            const res = await player.search(query, { requester: interaction.user });

            if (!res.tracks || !res.tracks.length) {
                return interaction.editReply({ content: `${no} No results found.` });
            }

            if (res.type === 'PLAYLIST') {
                for (const track of res.tracks) {
                    player.queue.add(track);
                }

                if (!player.playing && !player.paused) {
                    player.play();
                }

                const playlistEmbed = new EmbedBuilder()
                    .setTitle(`🎶 Playlist Added`)
                    .setDescription(`**[${res.playlistName}](${query})**\n\n**Tracks Queued:** \`${res.tracks.length}\``)
                    .setFooter({ text: `Enjoy your music | Sinux Development` })
                    .setColor(0x00ff99);

                return interaction.editReply({ content: '', embeds: [playlistEmbed] });
            } else {
                const track = res.tracks[0];
                player.queue.add(track);

                if (!player.playing && !player.paused) {
                    player.play();
                }

                const songEmbed = new EmbedBuilder()
                    .setTitle(`🎵 Now Playing`)
                    .setDescription(`[${track.title}](${track.uri})`)
                    .setColor(0x00ccff)
                    .setFooter({ text: `Requested by ${interaction.user.tag}` })
                    .setTimestamp();

                return interaction.editReply({ content: '', embeds: [songEmbed] });
            }
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: `❌ An error occurred while trying to play the song.` });
        }
    }
};
