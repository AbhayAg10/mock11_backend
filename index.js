const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const { connection } = require("./config/db");
const { authenticate } = require("./middlewares/authentication");
const { UserModel } = require("./models/User.Model");

require("dotenv").config();
const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const userPresent = await UserModel.findOne({ email });
  if (userPresent?.email) {
    res.send("User Already Exists");
  } else {
    try {
      bcrypt.hash(password, 5, async function (err, hash) {
        const user = new UserModel({ email, password: hash });
        await user.save();
        res.send("Signup Successful");
      });
    } catch (err) {
      console.log(err);
      res.send("Something went wrong, Please try again later");
    }
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  // console.log(user);
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      console.log(user);
      const hashed_password = user.password;
      bcrypt.compare(password, hashed_password, function (err, result) {
        if (result) {
          const token = jwt.sign({ userID: user._id }, process.env.KEY);
          res.send({ msg: "Login successfull", token: token });
        } else {
          res.send("Login failed");
        }
      });
    } else {
      res.send("Login failed");
    }
  } catch {
    res.send("Something went wrong, please try again later");
  }
});

app.get("/about", (req, res) => {
  res.send("About us");
});

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Connected to db succesfully");
  } catch (err) {
    console.log("Error connectiong to DB");
    console.log(err);
  }
  console.log(`Listening to http://localhost:${process.env.PORT}`);
});
