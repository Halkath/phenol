const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const noPrefixSchema = require("../Schemas.js/noPrefixSchema");

const authorizedUsers = [""];
module.exports = {
    name: 'noprefix',
    description: 'Manages No Prefix Users',
    run: async (client, message, args) => {
        if (!authorizedUsers.includes(message.author.id)) {
            return;
        }
        if (!args[0]) {
            return message.reply("Please Provide a valid subcommand : \n1. add.\n2. remove.\n3. list .");
        }
        const subCommand = args[0].toLowerCase();

        if (subCommand === 'add') {
            const user = message.mentions.first() || message.guild.user.cache.fetch(args[1]);

            if (!user) {
                return message.reply("Mention Id/User to add.");
            }
            try {
                const existing = await noPrefixSchema.findOne({ userId: user.id });
                if (existing) {
                    return message.reply("Already In Np List.");
                }
                const newUser = new noPrefixSchema({ userId: user.id });
                await newUser.save();
                message.reply("Included In np List!");
            } catch (error) {
                message.reply("An Error : ", error);
            }
        } else if (subCommand === 'remove') {
            const user = message.mentions.first() || message.guild.user.cache.fetch(args[1]);
            if (!user) {
                return message.reply("Mention Id/User to add.");
            }
            try {
                const removed = await noPrefixSchema.findOneAndDelete({ userId: user.id });
                if (!removed) {
                    return message.reply("Not Included In Np List.");
                }
                message.reply("Removed User From Np List.\n> Use ``?noprefix list`` for list of users.");
            } catch (error) {
                message.reply("An Error : ", error);
            }
        } else if (subCommand === "list") {
            try {
                const users = await noPrefixSchema.find({});
                if (users.length === 0) {
                    return message.reply("Empty No Prefix List");
                }
                const userList = users.map(user => `<@${user.userId}> | ${user.tag}`).join("\n");
                await message.reply(`\`\`\`js ${userList}\`\`\``);
            } catch (error) {
                message.reply("An Error : ", error);
            }
        } else {
            return message.reply("Please Provide a valid subcommand : \n1. add.\n2. remove.\n3. list .");
        }
    },
};