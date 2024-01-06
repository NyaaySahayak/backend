const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
const Question = require("../models/question_model");

const db = mongoose.connection;

router.get('/', async (req, res) => {
  res.json("hello!World")
});

router.post('/data', async (req,res)=>{
  const { question , answer} = req.body;
  try{
    const data = await Question.create({question, answer });
    res.status(200).json(data);
  }catch(error){
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
});

router.put('/data', async (req,res)=>{
  const {question , answer , _id} = req.body;
  try{
    const data = await Question.findById(_id, {question, answer})
    if (!data) {
      res.status(500).json({ error: 'Data not Found' });
    }
    res.status(200).json(data)
  }catch(error){
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
});


router.get('/data', async (req, res) => {
  try {
    const queCollection = db.collection('que');
    const data = await queCollection.find({}).toArray();
    console.log('Fetched data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
});

module.exports = router