const { model, Schema } = require('mongoose');

const joinRoleSchema = new Schema({
    GuildId: String,
    RoleIds: [String] // Array of role IDs
});

module.exports = model('joinrole', joinRoleSchema);
