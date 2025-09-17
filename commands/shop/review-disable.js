const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const reviewSchema = require("../../Schemas.js/reviewSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("review-disable")
        .setDescription("Disable Server review System"),
        async execute(interaction){
             if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: `🚫 You are missing the **Administrator** permission to use this command.`,
                    ephemeral: true
                });
            }
            const {guildId}    = interaction;
            const embed = new EmbedBuilder().setColor(`#2f3136`)
            try {
                const deleteResult = await reviewSchema.deleteMany({Guild: guildId});
                if(deleteResult.deleteCount >0){
                    embed.setDescription(`Reveiw System Disabled!`)
                }else{
                    embed.setDescription(`Reveiw System Was Disabled Previously!`)
                }

                await interaction.reply({embeds: [embed]})
            } catch (error) {
                console.log(error)
                embed.setDescription(`Failed to disable The review System!`)

                 return interaction.reply({embeds: [embed],ephemeral: true})
            }
            }
}