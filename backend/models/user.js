const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        unique: true, 
        required: true,
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
    },
    password: { type: String, required: true },
    profilePic: { type: String },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
