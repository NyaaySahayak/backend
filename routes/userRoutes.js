const express = require("express");
const router = express.Router();
const User = require("../models/user_models");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


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

router.get("/test", authenticateToken, (req, res) => {
    res.send("Token Verified, Authorizing User...");
  });

module.exports = router;