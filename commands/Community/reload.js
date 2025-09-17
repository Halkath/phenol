const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all commands (slash + prefix)')
        .setDefaultMemberPermissions(0), // dev only, or manage perms later

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        let totalSlash = 0;
        let totalPrefix = 0;

        try {
            // ──────────────── Reload Slash Commands ────────────────
            client.slashCommands = new Map();

            const slashFolders = fs.readdirSync('./src/commands').filter(folder => !folder.startsWith('.'));
            for (const folder of slashFolders) {
                const folderPath = `./src/commands/${folder}`;
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

                for (const file of commandFiles) {
                    const filePath = path.join(__dirname, `../${folder}/${file}`);
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    if (command.data && command.data.name) {
                        client.slashCommands.set(command.data.name, command);
                        totalSlash++;
                    }
                }
            }

            // ──────────────── Reload Prefix Commands ────────────────
            client.prefixCommands = new Map();

            const prefixPath = path.join(__dirname, '../../prefix');
            const prefixFolders = fs.readdirSync(prefixPath).filter(folder => !folder.startsWith('.'));

            for (const folder of prefixFolders) {
                const folderPath = path.join(prefixPath, folder);
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

                for (const file of commandFiles) {
                    const filePath = path.join(folderPath, file);
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    if (command.name) {
                        client.prefixCommands.set(command.name, command);
                        totalPrefix++;
                    }
                }
            }

            // ──────────────── Update Slash Commands with Discord ────────────────
            if (client.application?.commands) {
                await client.application.commands.set(
                    [...client.slashCommands.values()].map(cmd => cmd.data.toJSON())
                );
            }

            // ──────────────── Success Embed ────────────────
            const embed = new EmbedBuilder()
                .setTitle('✅ Reload Complete')
                .setDescription(`Reloaded **${totalSlash} Slash** and **${totalPrefix} Prefix** commands.`)
                .setColor('Green')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: `❌ Failed to reload: \`${error.message}\``,
                ephemeral: true
            });
        }
    }
};
