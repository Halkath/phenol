const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of all bot commands'),

    async execute(interaction, client) {
        const commandFolders = fs.readdirSync('./src/commands').filter(folder => !folder.startsWith('.'));
        const commandsByCategory = {};

        for (const folder of commandFolders) {
            const folderPath = `./src/commands/${folder}`;
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            const commands = [];

            for (const file of commandFiles) {
                const filePath = path.join(__dirname, `../${folder}/${file}`);
                const command = require(filePath);

                if (command.data && command.data.name && command.data.description) {
                    commands.push({
                        name: command.data.name,
                        description: command.data.description
                    });
                }
            }

            commandsByCategory[folder] = commands;
        }

        const dropdownOptions = Object.keys(commandsByCategory).map(folder => ({
            label: folder.charAt(0).toUpperCase() + folder.slice(1),
            value: folder
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('category-select')
            .setPlaceholder('Select a category to view commands')
            .addOptions(dropdownOptions);

        const embed = new EmbedBuilder()
            .setTitle('📖 Help Menu')
            .setDescription(`Use the dropdown below to view commands by category.`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'Sinux Development' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: 3, // Type 3 = StringSelect
            time: 60_000, // 1 minute
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id)
                return i.reply({ content: 'You cannot use this menu.', ephemeral: true });

            const selectedCategory = i.values[0];
            const categoryCommands = commandsByCategory[selectedCategory];

            const categoryEmbed = new EmbedBuilder()
                .setTitle(`${selectedCategory} Commands`)
                .setDescription(`📂 List of all commands in the **${selectedCategory}** category.`)
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(categoryCommands.map(cmd => ({
                    name: `/${cmd.name}`,
                    value: cmd.description,
                    inline: false
                })))
                .setFooter({ text: 'Sinux Development' })
                .setTimestamp();

            await i.update({ embeds: [categoryEmbed], components: [row] });
        });

        collector.on('end', () => {
            // Disable the menu after collection time ends
            const disabledMenu = StringSelectMenuBuilder.from(selectMenu).setDisabled(true);
            const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
            interaction.editReply({ components: [disabledRow] }).catch(() => {});
        });
    }
};
