const { model , schema} =  require('mongoose');

const schema = new Schema({
    guildId: String,
    autoresponse: [
        {
            trigger: String,
            response: String
        }
    ]
})
module.exports = model('name', schema);
