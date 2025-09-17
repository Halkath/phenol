const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

const access = ["1038755954772152400",'1139946976763457619']; // Allowed user IDs
const emoji = {
    done: "<:sinux_correct:1348307382043938857>",
    cross: "<:Sinux_wrong:1274571568529412159>"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Sends a reminder to the selected user via DM.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Select the user to remind")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        // Access check
        if (!access.includes(interaction.user.id)) {
            return await interaction.reply({
                content: `${emoji.cross} Missing access to operate this command.`,
                ephemeral: true
            });
        }

        const member = interaction.options.getMember("user");

        if (!member) {
            return await interaction.reply({
                content: `${emoji.cross} Could not find that member.`,
                ephemeral: true
            });
        }

        try {
            // Send DM
            await member.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2f3136")
                        .setDescription(`⏰ You have a reminder from **${interaction.user.tag}**. Please visit ${interaction.channel} ASAP.`)
                ]
            });

            await interaction.reply({
                content: `${emoji.done} Reminder sent to ${member.user.tag}.`,
                ephemeral: true
            });

        } catch (err) {
            console.error("DM failed:", err);
            return await interaction.reply({
                content: `${emoji.cross} Failed to send a reminder. The user may have DMs disabled.`,
                ephemeral: true
            });
        }
    }
};
