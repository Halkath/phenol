const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed-builder")
        .setDescription("Creates a custom embed"),

    async execute(interaction) {



        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: `❌ Invalid access.`,
                ephemeral: true
            });
        }

    
        const modal = new ModalBuilder()
        .setTitle("Embed Builder")
        .setCustomId("modal");

    const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setRequired(true)
        .setPlaceholder("Enter your embed title here.")
        .setStyle(TextInputStyle.Short);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description')
        .setRequired(true)
        .setPlaceholder("Enter your embed description here.")
        .setStyle(TextInputStyle.Paragraph);

    const colorInput = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('Color')
        .setRequired(false)
        .setPlaceholder("Hex code (e.g., #00ffff)")
        .setStyle(TextInputStyle.Short);

    const imageInput = new TextInputBuilder()
        .setCustomId('image_link')
        .setLabel('Image URL')
        .setRequired(false)
        .setPlaceholder("Enter image link (optional)")
        .setStyle(TextInputStyle.Short);

    const thumbnailInput = new TextInputBuilder()
        .setCustomId('thumbnail')
        .setLabel('Thumbnail URL')
        .setRequired(false)
        .setPlaceholder("Enter thumbnail link (optional)")
        .setStyle(TextInputStyle.Short);

    // Group inputs into action rows
    const actionRows = [
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(colorInput),
        new ActionRowBuilder().addComponents(imageInput),
        new ActionRowBuilder().addComponents(thumbnailInput),
    ];

    modal.addComponents(...actionRows);

    await interaction.showModal(modal);
}
};
