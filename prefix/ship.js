const canvafy = require('canvafy');

module.exports = {
    name: 'love',

    run: async (client, message, args) => {
        let member = message.mentions.members.first();
        if (!member) {
            return message.reply({
                content: `Mention someone!`
            });
        } else if (member.id === message.author.id) {
            return message.reply({
                content: `Mention someone else!`
            });
        }

        const love = await new canvafy.Ship()
            .setAvatars(
                message.author.displayAvatarURL({
                    forceStatic: true,
                    extension: 'png'
                }),
                member.user.displayAvatarURL({
                    forceStatic: true,
                    extension: 'png'
                })
            )
            .setBackground("image", "https://i.ibb.co/7z5G2DP/default-bg.png") // example bg image
            .setBorder("#f0f0f0")
            .setOverlayOpacity(0.5)
            .build();

        message.reply({
            files: [
                {
                    attachment: love,
                    name: `ship-${message.member.id}.png`
                }
            ]
        });
    }
};
