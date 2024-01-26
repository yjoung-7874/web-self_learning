const question = require("./model/Question");
const answer = require("./model/Answer");
const fs = require("fs");
const fileConvert = require("./data/utils/fileConvert")
const CSV = require("./data/utils/handleCSV")

const Collections = { questions: question, answers: answer, };

function filterArrayByChapter(docs, array){
  let returnArray = [];
   array.forEach((cpt) => {
      docs.forEach((element) => {
          if(element.chapter.includes(cpt)){returnArray.push(element);}
      });
  });
  return returnArray;
}

function filterResultByHandler(docs, handler) {
  let returnArray = [];
  docs.forEach((element) => {
    console.log(element.result.length)
    if (element.result.length !== 0 && element.result.some(handler)) {
        returnArray.push(element)
    }
  })
  return returnArray
}

function getMultipleRandom(arr, num) {
  const shuffeld = [...arr].sort(() => 0.5- Math.random())
  return shuffeld.slice(0,num)
}

module.exports.getQuestions = async (infos) => {
  // infos = { questionType: String, difficulty: Array, chapter, paper: Array, timezone: Array, }
  console.log('getQuestions, infos: ', infos)

  let query = {
    'difficulty': { $in: infos.difficulty },
    'timezone' : {$in: infos.timezone },
    'paper' : {$in: infos.paper},
  }

  const returned = await Collections.questions.find(query)
  .then((docs) => filterArrayByChapter(docs, infos.chapter))
  .then((docs) => {
    if (infos.wrong || infos.bookmarked) {
      let filteredDocs = filterResultByHandler(docs, e => e.userEmail === infos.userEmail)
      infos.wrong && filterResultByHandler(filteredDocs, e => e.wrong >= infos.wrong)
      infos.bookmarked && filterResultByHandler(filteredDocs, e => e.bookmarked === infos.bookmarked)
      return filteredDocs
    } else {
      return docs
    }
  })

  let result = isNaN(infos.questionNumber) ? 
                returned : getMultipleRandom(returned, infos.questionNumber)
  console.log('getQuestions, result:', result)

  return result
};

module.exports.getMultipleAnswers = async (infos) => {
  /* infos: {answerId, specificAnswerId} */
  console.log("getMultipleAnswers, infos: ", infos);

  const returnList = [];
  for(let i = 0; i < infos.length; i++){
    let result = "";
    infos[i].specificAnswerId == undefined ? 
      result = await Collections.answers.findOne({
        'answerID' : { $in: infos[i].answerId },
      }) :
      result = await Collections.answers.findOne({
        'answerID' : { $in: infos[i].answerId },
        'answer.specificAnswerID': { $in: infos[i].specificAnswerId },
      })

      returnList.push(result);
  }
  console.log("getMultipleAnswers result", returnList);
  return returnList;
};

module.exports.getAnswers = async (infos) => {
  console.log("getAnswers called, infos: ", infos);
  let result = [];
  if(infos.specificAnswerId == undefined){
    result = await Collections.answers.find({
      'answerID' : { $in: infos.answerId },
    })
  } else {
    result = await Collections.answers.find({
      'answerID' : { $in: infos.answerId },
      'answer.specificAnswerID': { $in: infos.specificAnswerId },
    })
  }
  console.log("getAnswers result: ", result);
  
  return result;
};

module.exports.saveQuestion = async (infos) => {
  console.log("saveQuestion, infos: ", infos);
  let query = { 
    "questionId": infos.questionId,
    'question.subQuestion': { 
      $elemMatch: { specificQuestionId: infos.specificQuestionId }
    },
    'result': { 
      $elemMatch: { userEmail: infos.userEmail }
    }
  }
  let value = {
    'userEmail': infos.userEmail,
    'bookmarked': infos.bookmarked,
    'wrong': infos.wrong
  }

  await Collections.questions.countDocuments(query)
  .then( async (count) => {
    if (count === 1) {
      let doc = await Collections.questions.findOne(query)
      let found = doc.result.findIndex(e => e === infos.userEmail)
      found !== -1 ? doc.result.push(value) : doc.result[found] = value
      
      await Collections.questions.findOneAndUpdate(query, doc)
      .then(() => console.log("saveQuestion done, bookmark:", 
                                infos.bookmarked, ", times of wrong:", infos.wrong))
    } else if (count === 0) {
      await Collections.questions.findOne({
        "questionId": infos.questionId,
        'question.subQuestion': { 
          $elemMatch: { specificQuestionId: infos.specificQuestionId }
      }}).then(async (doc) => {
        doc.result = new Array()
        doc.result.push(value)
        console.log("to be saved:", doc)
        await Collections.questions.findOneAndUpdate({
          "questionId": infos.questionId,
          'question.subQuestion': { 
            $elemMatch: { specificQuestionId: infos.specificQuestionId }
        }}, doc)
      })
    } else {
      console.log("something wrong, no data or many data in collection.")
    }
  })
};

module.exports.uploadFilesQuestion = () => {
  CSV.readCSV(__dirname + '/data/dataInfo/Questions.csv').then((csv_data) => {
    // console.log("data: ", csv_data);
    let questionFilePath = __dirname + '/data/images/Questions/';
    let questionFileList = fs.readdirSync(questionFilePath, { withFileTypes: true }, (err, files) => {
      if (err) console.log(err);
      else return files
    })

    csv_data.forEach( async (data) => {
      let qfFound = questionFileList.find(element => element.name === data.questionImage);
      if (qfFound === undefined) {
        console.error('q) image name :', data.questionImage, 'is not available.')  
        return;
      } 
      let questionImageFile = fileConvert.base64_encode(questionFilePath + qfFound.name);

      let sqfFound = questionFileList.find(element => element.name === data.subQuestionImage);
      let subQuestionImageFile;
      if (sqfFound === undefined) {
        if (data.subQuestionImage === "None") subQuestionImageFile = ""
        else { 
          console.error('sq) image name :', data.subQuestionImage, 'is not available.')  
          return;
        }
      } else {
        subQuestionImageFile = fileConvert.base64_encode(questionFilePath + sqfFound.name)
      }
      
      let answerSubscripts_ = data.answerSubscripts.split(",")
      let chapter_ = data.chapter.split(",").map((e) => +e)

      let count_ = await Collections.questions.countDocuments({ 
        'questionId': data.questionID, 
        'question.subQuestion': { $elemMatch: { specificQuestionId: data.specificQuestionID }}
      })

      if (count_ === 1) { // exact document exist > update
        await Collections.questions.findOneAndUpdate({ 
          'questionId': data.questionID, 
          'question.subQuestion': { $elemMatch: { specificQuestionId: data.specificQuestionID }}
        }, {
          questionId: data.questionID, 
          question: {
            questionType: data.questionType,
            questionImage: {image: questionImageFile,},
            subQuestion: [{
              subQuestionImage: {image: subQuestionImageFile},
              specificQuestionId: data.specificQuestionID,
              numAns: data.numAns,
              unit: data.unit,
              marks: data.marks,
              instruction: data.instruction,
              answerSubscripts: answerSubscripts_,
            }],
          },
          chapter: chapter_,
          difficulty: data.difficulty, // easy, medium, hard
          paper: data.paper,
          timezone: data.timezone,
          season: data.season ,// W or S,
          year: data.year,
          result: []
        }, { 
          new: true, 
          overwrite: true
        })
      } else { // no document or many exist > delete and create new doc
        await Collections.questions.deleteMany({ 
          'questionId': data.questionID, 
          'question.subQuestion': { $elemMatch: { specificQuestionId: data.specificQuestionID }}
        }).then ( async () => {
          const newDoc = new Collections.questions({
            questionId: data.questionID, 
            question: {
              questionType: data.questionType,
            questionImage: {image: questionImageFile,},
              subQuestion: [{
                subQuestionImage: {image: subQuestionImageFile},
                specificQuestionId: data.specificQuestionID,
                numAns: data.numAns,
                unit: data.unit,
                marks: data.marks,
                instruction: data.instruction,
                answerSubscripts: answerSubscripts_,
              }],
            },
            chapter: chapter_,
            difficulty: data.difficulty, // easy, medium, hard
            paper: data.paper,
            timezone: data.timezone,
            season: data.season ,// W or S,
            year: data.year,
            result: []
          })
          await newDoc.save().then(()=>console.log("Question : delete and saved"))
        })
      }
    })    
  })
};


module.exports.uploadFilesAnswer = () => {
  // TODO : db check, getans func return check 
  //db();
  CSV.readCSV(__dirname + '/data/dataInfo/Answers.csv').then((csv_data) => {
    let answerFilePath = __dirname + '/data/images/Answers/';
    let answerFileList = fs.readdirSync(answerFilePath, { withFileTypes: true }, (err, files) => {
      if (err) console.log(err);
      else return files
    })
    csv_data.forEach( async (data) => {
      let ansFound = answerFileList.find((element) => { return element.name === data.answerImage });
      if (ansFound === undefined) {
        console.error('ans) answer name :', data.answerImage, 'is not available.')  
        return;
      } 
      let answerImageFile = fileConvert.base64_encode(answerFilePath + ansFound.name);
      
      let answerSubscripts_ = data.answerSubscripts.split(",");
      let answerValues = data.answerValues.split(",");
      console.log(answerValues, " and ", data.answerValues);

      let count_ = await Collections.answers.countDocuments({ 
        'answerID': data.answerID, 
        'answer.specificAnswerID': data.specificAnswerID 
      })

      if (count_ === 1) { // exact document exist > update
        await Collections.answers.findOneAndUpdate({ 
          'answerID': data.answerID, 
          'answer.specificAnswerID': data.specificAnswerID 
        }, {
          answerID: data.answerID, 
          answer: {
            answerType: data.answerType,
            answerImage: {image: answerImageFile},
            answerSubscripts: answerSubscripts_,
            specificAnswerID: data.specificAnswerID,    
            answerValues: answerValues,
          },
        }, { 
          new: true, 
          overwrite: true
        })
      } else { // no document or many exist > delete and create new doc
        await Collections.answers.deleteMany({ 
          'answerID': data.answerID, 
          'answer.specificAnswerID': data.specificAnswerID 
        }).then ( async () => {
          const newDoc = new Collections.answers({
            answerID: data.answerID, 
            answer: {
              answerType: data.answerType,
              answerImage: {image: answerImageFile},
              answerSubscripts: answerSubscripts_,
              specificAnswerID: data.specificAnswerID,
              answerValues: answerValues,    
            },
          })
          await newDoc.save().then(()=>console.log("Answer : delete and saved"))
        })
      }
    })    
  })      
};