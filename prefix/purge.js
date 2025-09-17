const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Cleans messages in the channel',

    /**
     * 
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`❌ You need the \`Manage Messages\` permission to use this command.`)
                ]
            });
        }

        const amount = parseInt(args[0]);
        const choice = args[1]?.toLowerCase();

        if (!amount || isNaN(amount)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`❌ Please provide a valid number of messages to delete.`)
                ]
            });
        }

        if (amount > 999) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`❌ You can’t delete more than **999** messages at once.`)
                ]
            });
        }

        await message.delete().catch(() => null);

        const fetched = await message.channel.messages.fetch({ limit: amount + 1 }).catch(() => null);
        if (!fetched) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`❌ Failed to fetch messages.`)
                ]
            });
        }

        let toDelete;

        if (choice === 'bots') {
            toDelete = fetched.filter(m => m.author.bot);
        } else if (choice === 'links') {
            toDelete = fetched.filter(m =>
                m.content.includes('http') || m.content.includes('https://') || m.content.includes('discord.gg')
            );
        } else {
            toDelete = fetched;
        }

        const deleted = await message.channel.bulkDelete(toDelete, true).catch(() => null);

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`✅ **Messages Purged:** ${deleted?.size || 0}`)
            ]
        });
    },
};
