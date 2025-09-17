const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const math = require("mathjs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("calculator")
        .setDescription("Evaluates a math expression")
        .addStringOption(option =>
            option.setName("expression")
                .setDescription("Math expression to calculate (e.g. 5 * (3 + 2))")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const expression = interaction.options.getString("expression");

        try {
            const result = math.evaluate(expression);

            const embed = new EmbedBuilder()
                .setColor(client.color || "#2f3136")
                .addFields(
                    { name: "📥 Expression", value: `\`\`\`${expression}\`\`\`` },
                    { name: "📤 Result", value: `\`\`\`${result}\`\`\`` }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setColor(client.color || "#FF0000")
                .setDescription(`${client.emoji?.cross || "❌"} | Invalid Expression.`);

            await interaction.reply({ embeds: [embed]});
        }
    }
};
