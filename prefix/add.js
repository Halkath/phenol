// commands/closerequest.js
const { EmbedBuilder } = require("discord.js");
const ticketSchema = require("../../Schemas.js/ticketSchema");

module.exports = {
  name: "add",
  description: "Add a user to this ticket",
  async execute(client, message, args) {
    const { channel, guild, author, member } = message;

    // ✅ Check if this is a ticket channel
    if (!channel.topic || !channel.topic.includes("Ticket Owner")) {
      return message.reply(client.emoji.cross + " | This is not a ticket channel.");
    }

    // ✅ Find ticket setup data
    const data = await ticketSchema.findOne({ GuildId: guild.id });
    if (!data) return message.reply("⚠️ Ticket system not set up.");

    // ✅ Check permissions (owner or staff role)
    const ownerId = channel.topic?.split(": ")[1];
    if (author.id !== ownerId && !member.roles.cache.has(data.Role)) {
      return message.reply(client.emoji.cross + " | Only the ticket owner or support staff can add users.");
    }

    // ✅ Get the user from mention or ID
    const user =
      message.mentions.users.first() ||
      guild.members.cache.get(args[0])?.user;

    if (!user) {
      return message.reply(client.emoji.cross + " | Please mention a user or provide a valid user ID.");
    }

    try {
      // ✅ Update channel permissions
      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      return message.reply({
        content: `<@${user.id}>`,
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(client.emoji.tick + ` | Added **${user.tag}** successfully.`),
        ],
      });
    } catch (error) {
      console.error(error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(client.emoji.cross + " | Failed to add user to the ticket."),
        ],
      });
    }
  },
};
