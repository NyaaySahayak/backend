const mongoose = require("mongoose");

const User = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {type: String, required: true},
    name: { type: String},
    age: {type: Number},
    specilization: {type: String},
    city: {type: String},
    contact: {type: String},
    address: {type: String}
},{
    collection: 'user-data'
})

const model = mongoose.model('UserData', User)
module.exports = model