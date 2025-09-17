const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const reviewSchema = require("../../Schemas.js/reviewSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("review")
        .setDescription("Give a review to the server")
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your review about the service')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(1000)
        )
        .addStringOption(option =>
            option.setName('review')
                .setDescription('Provide your review by giving ⭐')
                .setRequired(true)
                .addChoices(
                    { name: `⭐`, value: `⭐` },
                    { name: `⭐⭐`, value: `⭐⭐` },
                    { name: `⭐⭐⭐`, value: `⭐⭐⭐` },
                    { name: `⭐⭐⭐⭐`, value: `⭐⭐⭐⭐` },
                    { name: `⭐⭐⭐⭐⭐`, value: `⭐⭐⭐⭐⭐` }
                )
        ),

    async execute(interaction) {
        const message = interaction.options.getString('message');
        const stars = interaction.options.getString('review');

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setFooter({ text: "Sinux Development" });

        try {
            const data = await reviewSchema.findOne({ Guild: interaction.guild.id });

            if (!data) {
                embed.setDescription("Review system is not set up in this server.");
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Increase review count
            data.Count = (data.Count || 0) + 1;
            await data.save();

            const reviewEmbed = new EmbedBuilder()
                .setColor("#2f3136")
                .setDescription(`**Review:** ${message}`)
                .addFields(
                    { name: "Rating", value: stars, inline: true },
                    { name: "Author", value: `${interaction.user.tag} (ID: ${interaction.user.id})`, inline: false },
                    { name: "Total Reviews", value: `${data.Count}`, inline: true }
                )
                .setTimestamp();

            const channel = interaction.guild.channels.cache.get(data.Channel);
            if (!channel) {
                return await interaction.reply({
                    content: `Could not find the configured review channel.`,
                    ephemeral: true
                });
            }

            await channel.send({ embeds: [reviewEmbed] });

            embed.setDescription("Thanks for leaving a review!");
            embed.setTitle("Review Submitted");
            embed.setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error("Error processing review command:", error);
            return await interaction.reply({
                content: `An error occurred while processing your review.`,
                ephemeral: true
            });
        }
    }
};
