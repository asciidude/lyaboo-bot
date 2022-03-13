const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, index: true },
    password: String,
    email: String,
    avatar: String,
    premium: Boolean,
    developer: Boolean,
    verified: Boolean,
    private: Boolean,
    about: String,
    admin: Boolean,
    posts: Array,
    following: Array,
    followers: Array,
    nameColor: String,
    createdAt: Date,
    discord: Object,
    token: String
});

module.exports = model('User', userSchema);