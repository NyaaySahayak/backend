const express = require("express");
const router = express.Router();
const User = require("../models/user_models");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const refreshTokens = [];

router.post("/api/register", async (req, res) => {
    try {
        //Extracting email and password from the req.body object
        const { email, password } = req.body;
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
            const refreshToken = jwt.sign(email, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            const sanitizedUser = {
                _id: user._id,  
                name: user.name,
                email: user.email,
            };
            return res.status(200).json({ message: "User verified",User: sanitizedUser, token, refreshToken });
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
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).send("Could not verify token");
        }
        req.user = user;
    });
    next();
};

router.get("/test", authenticateToken, (req, res) => {
    res.json({"message": "User authorized"});
});

router.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) {
      return res.status(401).send("No refresh token provided!");
    }
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).send("Invalid Refresh Token");
    }
  
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).send("Could not Verify Refresh Token");
  
      const token = jwt.sign({email: req.body.email}, process.env.JWT_SECRET, { expiresIn: "10s" })
      res.json({ accessToken: token });
    });
  });

module.exports = router;