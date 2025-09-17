const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "uptime",
    description: "Show the time the bot has been online",
    aliases: ["up"],
    category: "info",

    run: async (client, message, args) => {
        const totalSeconds = Math.floor(client.uptime / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds % 86400 / 3600);
        const minutes = Math.floor(totalSeconds % 3600 / 60);
        const seconds = totalSeconds % 60;

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor("#2f3136")
            .setTitle("📶 Bot Uptime")
            .setDescription(`🕒 **${uptimeString}**`)
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
