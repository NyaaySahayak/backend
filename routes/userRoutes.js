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
    const advocates = await User.find({ role });
    console.log(advocates);
    res.json(advocates);
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.post("/api/change-password" , async (req, res) => {
  try {
    // Extracting new password, old password, and email from the req.body object
    const { newpassword, oldpassword, email } = req.body;

    // Checking if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Comparing provided old password with the hashed password stored in the database
    const oldPasswordMatch = await bcrypt.compare(oldpassword, user.password);

    if (oldPasswordMatch) {
      // Hashing the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

      // Updating the user with the new hashed password
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });

      return res.status(200).json({ message: "Password changed successfully" });
    } else {
      return res.status(401).json({ message: "Invalid old password" });
    }
  } catch (error) {
    res.status(500).send(error.message);
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
    const { email, password, role } = req.body;
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
        password: hash,
      });
      //Saving user to database
      user.save().then(() => {
        return res.json({ message: "User created successfully please Login", user });
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