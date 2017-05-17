/* eslint linebreak-style: ["error", "windows"]*/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
mongoose.connect('mongodb://noordean:ibrahim5327@ds161190.mlab.com:61190/nurudb');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const Schema = mongoose.Schema;
const question = new Schema({
  question: {
    type: String, required: true
  },
  idOfPoster: {
    type: Number, required: true
  },
  date: {
    type: Date, required: true
  },
  tag: {
    type: String, required: true
  },
  votes: {
    numberofvotes: {
      type: Number, required: false
    },
    voters: {
      type: Array, required: false
    }
  },
  notify: {
    type: String, required: true
  },
  answer: {
    poster: { type: Array, required: false }
  },
  views: {
    viewers: { type: Array, required: false }
  }
},
  { collection: 'Forum' }
);

const Question = mongoose.model('Question', question);

const answers = new Schema({
  questionid: {
    type: String, required: true
  },
  idOfPoster: {
    type: Number, required: true
  },
  value: {
    type: String, required: true
  },
  date: {
    type: Date, required: true
  },
  voters: {
    type: Array, required: false
  }
},
  { collection: 'Answers' }
);

const Answer = mongoose.model('Answer', answers);
app.get('/forum', (req, res) => {
  Question.find({}).sort({ date: -1 }).limit(10).exec((err, allQuestions) => {
    Question.find({}).exec((err, totalQuestion) => {
      if (err) {
        throw err;
      } else {
        const totalRecords = totalQuestion.length;
        res.render('pages/forum.ejs', { questions: allQuestions, totalRecord: totalRecords });
      }
    });
  });
});

app.post('/addQuestion', (req, res) => {
  const questionToAdd = req.body.question;
  const notifyToAdd = req.body.notify;
  const tagToAdd = req.body.tag;
  // to add id of logined in user as idOfPoster
  const newQuestion = new Question({
    question: questionToAdd,
    idOfPoster: 1,
    date: Date.now(),
    tag: tagToAdd,
    notify: notifyToAdd
  });
  newQuestion.save((err) => {
    if (err) {
      res.send(err);
    }
    res.send('Saved');
  });
});

app.get('/question/:id', (req, res) => {
  const id = req.params.id;
  if (id.length >= 20) {
    Question.findById(id, (err, uniqueQuestion) => {
      if (err) {
        throw err;
      }
      Answer.find({ questionid: id }, (err, uniqueAnswers) => {
        res.render('pages/question.ejs', { question: uniqueQuestion, uniqueAnswer: uniqueAnswers });
      });
    });
  } else {
    Question.find({ tag: id }, (err, singleQuestion) => {
      const totalRecords = singleQuestion.length;
      if (err) {
        throw err;
      }
      if (singleQuestion.length === 0) {
        res.render('pages/forum404.ejs');
      } else {
        res.render('pages/forum.ejs', { questions: singleQuestion, totalRecord: totalRecords });
      }
    });
  }
});

app.post('/addAnswer', (req, res) => {
  const answer = req.body.answer;
  const questionId = req.body.questionid;
  const userId = 1;   // to change to a real userId
  const newAnswer = new Answer({
    questionid: questionId,
    idOfPoster: userId,
    value: answer,
    date: Date.now()
  });
  newAnswer.save((err) => {
    if (err) {
      res.send(err);
    } else {
      res.send('Added');
    }
  });
});

app.post('/search', (req, res) => {
  const searchTerm = req.body.term;
  Question.find({ question: new RegExp(searchTerm, 'i') }).limit(5).exec((err, doc) => {
    if (err) {
      throw err;
    }
    res.send(doc);
  });
});

app.post('/addvote', (req, res) => {
  // to change to real user
  const userId = 1;
  const answerId = req.body.answerid;
  Answer.findById(answerId, (err, answer) => {
    const voters = answer.voters;
    if (voters.indexOf(userId) < 0) {
      voters.push(userId);
      answer.voters = voters;
      answer.save();
      res.send('Done');
    } else {
      res.send('You have voted already');
    }
  });
});

app.post('/addviews', (req, res) => {
  res.send('we register views here');
});

app.listen(8000);
