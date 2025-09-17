
const mongoose = require('mongoose');
const mongodbURL = process.env.MONGODBURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');

        if (!mongodbURL) return;

      try {
    await mongoose.connect(mongodbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("✅ MongoDB Connected!");
} catch (err) {
    console.error("❌ MongoDB connection error:", err);
}




        const activity = [
            'Join .gg/ahontop',
            'Chilling Server In Community',
            'Made By Sinux Devlopment'
        ]

        setInterval(() => {
            const botStatus = activity[Math.floor(Math.random() * activity.length)];
            client.user.setPresence({ activities: [{ name: `${botStatus}` }]});
        }, 3000)

        async function pickPresence () {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                await client.user.setPresence({
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,

                        },
                    
                    ],

                    status: statusArray[option].status
                })
            } catch (error) {
                console.error(error);
            }
        }
    },
};