const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  run: async (client, message, args) => {
    // Main help embed
    const home = new EmbedBuilder()
      .setAuthor({ name: `${client.user.username} - Help Menu!`, iconURL: client.user.displayAvatarURL() })
      .setDescription(
        `Hey there! I'm **${client.user.username}**, your multipurpose bot.\nYou can use \`?help \` to get more info on a command.\n\n` +
        `**Categories**\n` +
        `<a:sinux_enjoy:1391320953350258739>** : Fun**\n` +
        `<:sinux_pyaar:1406673556959662110>** : Image**\n` +
        `<a:Sinux_Commandlist:1113128938785493124>** : Information**\n` +
        `<a:Sinux_Staff:1135249594830311495>** : Moderation**\n` +
        `<:sinux_vc_vibe:1407252226409238613>** : Voice**\n\n` +
        `[Invite](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) | Support`
      )
      .setImage("https://media.discordapp.net/attachments/1062219555453288489/1065637201339236503/20230119_195122.jpg")
      .setColor("#2f3136");

    // Category dropdown
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help-menu")
        .setPlaceholder("Select a category")
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel("Fun Commands")
            .setEmoji("<a:sinux_enjoy:1391320953350258739>")
            .setValue("fun"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Image Commands")
            .setEmoji("<:sinux_pyaar:1406673556959662110>")
            .setValue("image"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Information Commands")
            .setEmoji("<a:Sinux_Commandlist:1113128938785493124>")
            .setValue("info"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Moderation Commands")
           .setEmoji("<a:Sinux_Staff:1135249594830311495>")
            .setValue("mod"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Voice Commands")
            .setEmoji("<:sinux_vc_vibe:1407252226409238613>")
            .setValue("vc")
        ])
    );

    // Buttons
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("home")
        .setEmoji("<:sinux_home:1391320432141013033>")
        .setLabel("Home")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel("Invite")
       // .setEmoji("🔗")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
     new ButtonBuilder()
  .setLabel("Support Server")
  .setStyle(ButtonStyle.Link)
  .setURL("https://discord.gg/dater")

    );

    await message.channel.send({
      embeds: [home],
      components: [menu, buttons]
    });
  }
};
