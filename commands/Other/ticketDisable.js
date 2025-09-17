const ticketSchema =require("../../Schemas.js/ticketSchema") ;


const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
module.exports= {  
    data : new SlashCommandBuilder()
    .setName('ticket-disable')
    .setDescription("Disables A Ticket System"),
    
 async execute(interaction, client) {
    try {
        const GuildId = interaction.guild.id;
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: `🚫 You are missing the **Administrator** permission to use this command.`,
                ephemeral: true
            });
        }
        const embed1 = new EmbedBuilder()
      .setColor('#00c7fe')
      .setDescription('Ticket System Has Been Disabled Already')
      .setTimestamp()
      .setAuthor({name: 'Ticket System'})
      .setFooter({text: 'Ticket System Disabled'} )

        const data = await ticketSchema.findOne({GuildId : GuildId})
        if(!data)
     return  await interaction.reply({embeds: [embed1], emhemeral: true});

      await ticketSchema.findOneAndDelete({GuildId : GuildId});

      const channel = client.channels.get(data.Channel);
      
      if(channel){
        await channel.messages.fetch({limit:1}).then(messages =>{
            const lastMessage = messages.first();
           if(lastMessage.author.id === client.user.id){
            lastMessage.delete();
           } 
        });
      }
        const embed2 = new EmbedBuilder()
        .setColor("#00c7fe")
        .setDescription("Ticket System has been disabled")
        .setTimestamp()
        .setAuthor({name: `Ticket System`})
        .setFooter({name: `Ticket System Disabled`})

            await interaction.reply({ embeds: [embed2]}); 
    } catch(err){
        console.error(err);
    }
 }
};