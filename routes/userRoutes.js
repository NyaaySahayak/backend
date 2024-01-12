const express = require("express");
const router = express.Router();
const User = require("../models/user_models");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  //Extracting token from authorization header
  const token = authHeader && authHeader.split(" ")[1];

  //Checking if the token is null
  if (!token) {
    return res.status(401).send("Authorization failed. No access token.");
  }

  //Verifying if the token is valid.
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send("Could not verify token");
    }
    req.user = user;
  });
  next();
};

//get all user details
router.get('/api/getusers', async (req, res) => {
  try {
    const role = "advocate";
    const advocates = await User.find({ role }).select('name email age contact city speciality').sort({ createdAt: -1 });
    
    res.status(200).json(advocates);

  } catch (error) {
    res.status(401).send(error.message);
  }
});

//delete a user
router.delete('/api/user', async (req, res) => {
  const UserEmail = req.body.email;
  try {
    // Find and delete the question from the database
    const deletedUser = await User.findOneAndDelete({email: UserEmail});

    if (deletedUser) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post("/api/login", async (req, res) => {
  try {
    //Extracting email and password from the req.body object
    const { email, password } = req.body;
    //Checking if user exists in database
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    //Comparing provided password with password retrived from database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "1800s" });

      const sanitizedUser = {
        _id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      };
      return res.status(200).json({ message: "User verified", User: sanitizedUser, token });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(401).send(error.message);
  }
});



router.post("/api/register", async (req, res) => {
  try {
    //Extracting email and password from the req.body object
    const { email, password, role, name, age,
      speciality,
      city,
      contact,
      } = req.body;
    //Checking if email is already in use
    let userExists = await User.findOne({ email });
    if (userExists) {
      res.status(401).json({ message: "Email is already in use." });
      return;
    }
    //salting
    const saltRounds = 10;
    //Hashing a Password
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) throw new Error("Internal Server Error");
      //Creating a new user
      let user = new User({
        role,
        email,
        name,
        age,
        speciality,
        city,
        contact,
        password: hash,
      });
      //Saving user to database
      user.save().then(() => {
        return res.json({ message: "User created successfully" });
      });
    });
  } catch (err) {
    res.status(401).send(err.message);
  }
});




router.get("/test", authenticateToken, (req, res) => {
  res.send("Token Verified, Authorizing User...");
});

module.exports = router;