const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: "vcmute",
    category: 'mod',
    
    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${client.emoji?.cross || '❌'} You must have \`Mute Members\` permission to use this command.`)
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${client.emoji?.cross || '❌'} I need \`Mute Members\` permission to mute someone.`)
                ]
            });
        }

        const target = message.mentions.members.first();
        if (!message.member.voice.channel) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Orange')
                        .setDescription(`${client.emoji?.cross || '❌'} You must be in a voice channel to use this command.`)
                ]
            });
        }

        if (!target) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Orange')
                        .setDescription(`${client.emoji?.cross || '❌'} You must mention a user to voice mute.`)
                ]
            });
        }

        if (!target.voice.channel || target.voice.channel.id !== message.member.voice.channel.id) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Orange')
                        .setDescription(`${client.emoji?.cross || '❌'} That user is not in your voice channel.`)
                ]
            });
        }

        try {
            await target.voice.setMute(true, `${message.author.tag} (${message.author.id})`);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`${client.emoji?.tick || '✅'} Successfully muted <@${target.user.id}> in voice channel.`)
                ]
            });
        } catch (err) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${client.emoji?.cross || '❌'} Failed to mute <@${target.user.id}> in voice.`)
                ]
            });
        }
    }
};
