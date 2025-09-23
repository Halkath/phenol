const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const WelcomeSetup = require("../../Schemas.js/welcomeSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome-message")
        .setDescription("Setup the welcome messsage for the server.")
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Variables: {server_members}, {server_name}, {user_mention}, {user_tag}.")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName("use_embed")
                .setDescription("Use Embed For The welcome Message.")
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            // ✅ Permission check
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | You need **Administrator** permission to use this command.`,
                    ephemeral: true
                });
            }

            const guildId = interaction.guild.id;
            const welcomemessage = interaction.options.getString("message");
            const use_embed = interaction.options.getBoolean("use_embed") || false;

            const exist = await WelcomeSetup.findOne({ guildId });
            if (!exist) {
                return await interaction.reply({
                    content: `${client.emoji.cross} | Setup Dosen't Exist ! Try \`/welcome setup\` first.`,
                    ephemeral: true
                });
            }

            exist.welcomeMessage = welcomemessage;
            exist.useEmbed = use_embed;
            await exist.save();

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.tick} | Welcome Message Setuped.`)
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],
                ephemeral: false
            });

        } catch (error) {
            console.error("Error\n", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: `${client.emoji.cross} | Error ! While Executing Cmd`,
                    ephemeral: true
                });
            }
        }
    }
};
