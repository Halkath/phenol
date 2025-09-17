const {
    EmbedBuilder,
    Events
} = require("discord.js");

function handleLogs(client) {
    const logSchema = require("../Schemas.js/logSchema");

    function send_logs(guildId, embed) {
        logSchema.findOne({ Guild: guildId }, async (err, data) => {
            if (!data || !data.Channel) return;
            const logChannel = client.channels.cache.get(data.Channel);

            if (!logChannel) return;
            embed.setTimestamp();

            try {
                logChannel.send({
                    embeds: [embed]
                });

            } catch (error) {
                console.log("Error ! Sending Logs \n", error);
            }
        });
    }

    client.on("messageDelete", function (message) {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("Message Deleted")
                .setTimestamp()
                .addFields({
                    name: `Author`,
                    value: `<@${message.author.id}> | ${message.author.tag}`
                })

                .addFields({
                    name: `Channel`,
                    value: `${message.channel}>`
                })

                .addFields({
                    name: `Deleted message`,
                    value: `<@${message.content}>`
                })

                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    });

     client.on("guildChannelpermissionsUpdate", function (message) {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("Channel Updated")
                .setTimestamp()
                .addFields({
                    name: `Channel`,
                    value: `${channel}`
                })

                .addFields({
                    name: `Channel`,
                    value: `${message.channel}>`
                })

                .addFields({
                    name: `Changes`,
                    value: `Channels's Permissions/name where Updated`
                })
                .addFields({
                    name: `Author`,
                    value: `<@${message.author.id}> | ${message.author.tag}`
                })

                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    })

    client.on("guildmemberBoost", function (message) {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("Server Boost")
                .setTimestamp()
                .addFields({
                    name: `Member`,
                    value: `<@${message.user.id}> | ${message.user}`
                })
               
                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    })

     client.on("guildmemberUnBoost", function (message) {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("Server Boost Removed")
                .setTimestamp()
                .addFields({
                    name: `Member`,
                    value: `<@${message.user.id}> | ${message.user}`
                })
               
                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    })

     client.on("guildMemberRoleAdd", function (message) {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("User Role Update(Add)")
                .setTimestamp()
                
                .addFields({
                    name: `Member`,
                    value: `${message.user}`
                })

                .addFields({
                    name: `Role`,
                    value: `${role}`
                })
                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    })

    client.on("guildMemberRoleRemove", function (message) {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("User Role Update (Removed)")
                .setTimestamp()
                
                .addFields({
                    name: `Member`,
                    value: `${message.user}`
                })

                .addFields({
                    name: `Role`,
                    value: `${role}`
                })
                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    })

     client.on("guildMemberNicknameUpdate", (member, oldNickname, newNickname) => {
        try {
            if (message.guild === null) return;
            if (message.author.bot) return;

            const embed = new EmbedBuilder()
                .setTitle("User Role Update (Removed)")
                .setTimestamp()
                
                .addFields({
                    name: `Old Nickname`,
                    value: `${oldNickname || 'Unknown'}`
                })

                .addFields({
                    name: `New Nickname`,
                    value: `${newNickname || 'Unknown'}`
                })
                return send_logs(message.guild.id, embed);
        } catch (error) {
    console.log("Couldn't Log messages \n\n", error);
        }
    })
}

module.exports = { handleLogs };
