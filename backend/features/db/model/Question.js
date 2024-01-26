const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    userEmail: { type: String },
    bookmarked: { type: String, default: 'false' },
    wrong: { type: Number, default: 0 }
  })
  

const imageSchema = new mongoose.Schema({
    image: {type: String,}
});

const questionInfoSchema = new mongoose.Schema({
    questionType: {type: String,},

    questionImage: imageSchema,
    subQuestion: [{
        subQuestionImage: imageSchema,
        specificQuestionId: {type: String},
        numAns: {type: Number},
        unit: {type: String},
        marks: {type: Number},
        instruction: {type: String},
        answerSubscripts: { type: Array },
    }],
})

const QuestionSchema = new mongoose.Schema({
    questionId: { type: Number, required: true, },
    question: questionInfoSchema,
    chapter: { type: Array },
    difficulty: {type: String}, // easy, medium, hard
    paper: {type: String},
    timezone: {type: Number},

    result: [ resultSchema ]
})

module.exports = mongoose.model("question", QuestionSchema, "Questions")