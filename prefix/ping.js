const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    category: "info",

    run: async (client, message, args) => {
        // Initial embed showing "Pinging"
        let embed = new EmbedBuilder()
            .setDescription(`**<:Sinux_User:1275090870429024331> | Pong**`)
            .addFields(
                { name: `**Message Latency**`, value: "```nim\nPinging```", inline: true },
                { name: `**API Latency**`, value: "```nim\nPinging```", inline: true }
            )
            .setColor(client.color || "#2f3136");

        const msg = await message.channel.send({ embeds: [embed] });

        // Updated embed with actual latency values
        embed = new EmbedBuilder()
            .setDescription(`<:Sinux_User:1275090870429024331> | Pong`)
            .addFields(
                {
                    name: `**Message Latency**`,
                    value: `\`\`\`nim\n${msg.createdTimestamp - message.createdTimestamp}ms\`\`\``,
                    inline: true
                },
                {
                    name: `**API Latency**`,
                    value: `\`\`\`nim\n${Math.round(client.ws.ping)}ms\`\`\``,
                    inline: true
                }
            )
            .setColor(client.color || "#2f3136");

        await msg.edit({ embeds: [embed] });
    }
};
