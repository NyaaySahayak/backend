const mongoose = require("mongoose");

const Question = new mongoose.Schema({
    question: { type: String, required: true, unique: true },
    answer: { type: String, required: true },
    category: {type: String, required: true},
    createdAt: {type: Date,default: Date.now,},
},
{
    collection: 'question'
}
)

const model = mongoose.model('QuestionsData', Question)
module.exports = model