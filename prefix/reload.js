const { EmbedBuilder } = require("discord.js");

const devs = ['972461778309111878', '992403878425411745', '902234198499278898', '946776981138198679'];

module.exports = {
  name: "reload",
  aliases: ["rlcmd", "rl"],
  category: "dev",
  run: async (client, message, args) => {
    if (!devs.includes(message.author.id)) return;

    try {
      if (!args[0]) {
        const opp = new EmbedBuilder()
          .setColor(0x2f3136)
          .setDescription("❌ | You didn't provide the command name.");
        return message.channel.send({ embeds: [opp] });
      }

      let reload = false;

      for (let i = 0; i < client.categories.length; i++) {
        let dir = client.categories[i];
        try {
          delete require.cache[
            require.resolve(`../`)
          ];
          client.commands.delete(args[0]);
          const pull = require(`../../commands/${dir}/${args[0]}.js`);
          client.commands.set(args[0], pull);
          reload = true;
          break; // once reloaded, stop checking other dirs
        } catch (err) {
          // ignore if not found in this category
        }
      }

      if (reload) {
        const op = new EmbedBuilder()
          .setColor(0x2f3136)
          .setDescription(`✅ | Successfully reloaded \`${args[0]}\``);
        return message.channel.send({ embeds: [op] });
      }

      const notop = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(`❌ | I was unable to reload \`${args[0]}\``);
      return message.channel.send({ embeds: [notop] });
    } catch (e) {
      const emesdf = new EmbedBuilder()
        .setColor(0x2f3136)
        .setDescription(`❌ | I was unable to reload \`${args[0]}\``);
      return message.channel.send({ embeds: [emesdf] });
    }
  },
};
