const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const WelcomeSetup = require("../../Schemas.js/welcomeSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome-test")
        .setDescription("Test The Welcome Message For the Server."),
    async execute(interaction, client) {
        try {
            const guildId = interaction.guild.id;
            const exist = await WelcomeSetup.findOne({ guildId });
            if (!exist) {
                return await interaction.reply({
                    content: `Setup Dosen't Exist ! Try \`/welcome setup\` first.`,
                    ephemeral: true
                });
            }
 if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | You need **Administrator** permission to use this command.`,
                    ephemeral: true
                });
            }
            const channel = interaction.guild.channels.cache.get(exist.channelId);
            if (!channel) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | Configured Welcome Channel Dosen't Exist.`,
                    ephemeral: true
                });
            }

            const userAvatar = interaction.user.displayAvatarURL({
                format: 'png',
                dynamic: true
            });

            let MessageContent = exist.welcomeMessage
                .replace(`{server_member}`, interaction.guild.memberCount)
                .replace(`{user_mention}`, `<@${interaction.user.id}>`)
                .replace(`{user_tag}`, interaction.user.username)
                .replace(`{server_name}`, interaction.guild.name);

            if (exist.user_embed) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setTimestamp()
                    .setTitle("Welcome")
                    .setDescription(MessageContent)
                    .setFooter({ text: `Made with <3 | ${interaction.guild.name}` })
                    .setThumbnail(userAvatar);

                await channel.send({
                    content: `Welcome ! <@${interaction.user.id}>`,
                    embeds: [embed]
                });
            } else {
                await channel.send(MessageContent);
            }

            await interaction.reply({
                content: `${client.emoji.tick} | Test Welcome message  : ${channel}\nCheck If Bot Has Sufficent Permissions To send Messages. `
            });

        } catch (error) {
            console.error("Error!\n", error);
        }
    }
};
