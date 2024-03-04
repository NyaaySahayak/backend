const express = require("express");
const router = express.Router();
const Question = require("../models/question_model");



router.post('/data', async (req, res) => {
  const { question, answer, category } = req.body;
  try {
    const data = await Question.create({ question, answer , category});
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
});

router.delete('/data', async (req, res) => {
  const question = req.body.question;
  try {
    const deletedquestion = await Question.findOneAndDelete({ question: question });
    if (deletedquestion) {
      res.status(200).json({ message: 'Question deleted successfully' });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/data', async (req, res) => {
  const { question, answer, _id } = req.body;
  try {
    const data = await Question.findByIdAndUpdate(_id, { question, answer })
    if (!data) {
      res.status(500).json({ error: 'Data not Found' });
    }
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
}); 


router.get('/data', async (req, res) => {
  try {
    // const queCollection = db.collection('que');
    const data = await Question.find({}).sort({createdAt: -1});
    // console.log('Fetched data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
});

module.exports = router;