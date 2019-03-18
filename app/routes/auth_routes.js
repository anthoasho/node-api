var mongoose     = require("mongoose");
const db         = require("../models");
var jwt          = require("jsonwebtoken");



exports.login = async function(req, res){
  try{
    let user = await db.User.findOne({username: req.body.username}).select("+password")
    if(!user) throw "User does not exist" //reconfigure errors to be consistent
    let comparedPassword = await user.comparePassword(req.body.password)
    if(!comparedPassword) throw "Incorrect password"
    let signed = {
      username: user.username,
      _id: user._id
    }
    let token =  jwt.sign(signed, process.env.AUTH_KEY) //user._id or user.username?
    let response = {
      ...signed,
      token,
    }
    res.json(response)

  }
  catch(error){
    console.log(error)
    res.send(error)
  }
}
