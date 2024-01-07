const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
const authRoutes = require("./routes/userRoutes");
const cors = require('cors');
const dataRoutes = require('./routes/questionRoutes.js')

dotenv.config();

const app = express();

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.use('/',authRoutes);
    app.use('/',dataRoutes);
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB: ${error}`);
  });


