const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const webaccess = ['1038755954772152400']; // Replace with allowed user IDs

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Sends a message as the bot or webhook")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Message type")
                .setRequired(true)
                .addChoices(
                    { name: "Normal", value: "normal" },
                    { name: "Embed", value: "embed" },
                    { name: "Webhook", value: "webhook" }
                )
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Message content")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("webhook-name")
                .setDescription("Webhook name (only if type is webhook)")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("webhook-avatar")
                .setDescription("Webhook avatar URL (only if type is webhook)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const type = interaction.options.getString("type");
        const content = interaction.options.getString("message");
        const webhookName = interaction.options.getString("webhook-name") || interaction.client.user.username;
        const webhookAvatar = interaction.options.getString("webhook-avatar") || interaction.client.user.displayAvatarURL();

        if (type === "webhook") {
            if (!webaccess.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "🚫 You don't have permission to use the webhook feature.",
                    ephemeral: true
                });
            }

            const webhook = await interaction.channel.createWebhook({
                name: webhookName,
                avatar: webhookAvatar
            });

            await webhook.send(content);
            await webhook.delete();

            return interaction.reply({ content: "✅ Message sent via webhook!", ephemeral: true });
        }

        if (type === "embed") {
            const embed = new EmbedBuilder()
                .setDescription(content)
                .setColor("Blue");

            await interaction.channel.send({ embeds: [embed] });
        } else {
            await interaction.channel.send({ content });
        }

        await interaction.reply({ content: "✅ Message sent!", ephemeral: true });
    }
};
