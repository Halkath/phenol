const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require("discord.js");
const logSchema = require("../../Schemas.js/logSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mod-logs")
        .setDescriptin("Configure moderation Logs in the server")
        .setSubCommand(
            command => command.setName("setup")
                .setDescription("Setup log Channel").addChannelOption(
                    option => option.setName("channel")
                        .addRequired(false)
                        .setChannnelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncment)
                        .setDescription("..")
                )
        )
        .addSubCommand(
            command => command.setname("disable")
                .setDescription("Stops Logging mod activity")
        ),

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply("> **Missing `Administrator` Permissions To Setup Mod logs.**");
        }
        const embed = new EmbedBuilder().setFooter("Sinux Devlopment").setColor(client.color)
        const sub = await interaction.options.getSubCommand();
        const data = await logSchema.findOne({
            Guild: interaction.guild.id
        });
        switch (sub) {
            case "setup": {
                if (data) {
                    return await interaction.reply({
                        embeds: [
                            embed
                                .setDescription(`${client.emoji.arrow} Status: ${client.emoji.cross}\n\n __Already Setuped logs System In This Server__`)
                                .setFooter({
                                    text: `Run /mod-logs disable to disable`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                                })

                        ]
                    });
                }
                else {
                    const logChannel = interaction.options.getChannel('channel')
                        || interaction.channel;
                    await interaction.reply({
                        embeds: [
                            embed
                                .setAuthor({ text: `Logging System` })
                                .setTitle(client.emoji.tick + `| logging Enabled`)
                                .setDescription('Now this chanel is setuped to logs channel : ', logChannel)
                        ]
                    });
                    await logSchema.create({
                        Guild: interaction.guild.id,
                        Channel: logChannel
                    });
                }
            }
                break;
            case "disable": {
         if (!data) {
                    return await interaction.reply({
                        embeds: [
                            embed
                                .setDescription(`${client.emoji.arrow} Status: ${client.emoji.cross}\n\n __Already Disabled logs System In This Server__`)
                                .setFooter({
                                    text: `Run /mod-logs setup to disable`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
                                })
                        ]
                    });
                } else {
                   // const logChannel = interaction.options.getChannel('channel') || interaction.channel;
                    await interaction.reply({
                        embeds: [
                            embed
                                .setAuthor({ text: `Logging System` })
                                .setTitle(client.emoji.tick + `| logging Disabled`)
                                .setDescription('Now this chanel is disabled to logs channel .')
                        ]
                    });
                    await logSchema.deleteMany({
                        Guild: interaction.guild.id,
                    });
                }
                break;
            }
        }
    }
}