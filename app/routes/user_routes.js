var mongoose     = require("mongoose");
const db         = require("../models");
var jwt          = require("jsonwebtoken");
let auth          = require("../middleware/authentication");

//Basic create new User
//Password is encrypted in the pre function of the User model
exports.newUser = async function(req,res){
  try{
    const user = {
      username: req.body.username,
      password: req.body.password
    }
    let createdUser = await db.User.create(user);
    let token =  jwt.sign(createdUser._id.toJSON(), process.env.AUTH_KEY)
    res.status(201).json({username: createdUser.username, token: token})
  }
  catch(error){
    console.log("error: " + error)
    res.status(500).json(error)
  }
}

//TODO expand and limit
exports.getUsers = async function(req, res){
  try{
    let foundUser = await db.User.find()
    res.json(foundUser);
  }
  catch(error){
    res.json(error)
  }
}

//Get a list of a user and populate ratings
exports.userIdGet = async function(req, res){
  try{
    let foundUser = await db.User.findOne({username: req.params.id}).populate("ratings._id", {username: true})
    if(!foundUser) throw {code: 404, details: "User does not exist!"}
    res.status(200).json(foundUser)
  }
  catch (error){
    res.status(error.code).json(error)
  }
}


//Post functions to user ID route
exports.userIdPost = async function(req, res){
  let action = req.query.action;
  try{
    if(action === "rate") await exports.rateUser(req, res)
    if(!action) throw {code: 300, details:  "Please do something"}
    else throw {code: 403, details: "You can't do that!"}
  }
  catch(e){
    console.log(e)
    res.send(e)
  }
}

exports.rateUser = async function(req, res){
//Take in a username and checks index, if not present add ObjectID to an array with rating
  try{
    let ratedUser = await db.User.findOne({username: req.params.id})
    if(!ratedUser) throw {code: 404, details: "User does not exist!"};
    let newRating = {_id: ratedUser._id, score: req.body.score}
    let loggedInUser = await db.User.findById(res.locals.user)
    let ratingsArray = loggedInUser.ratings
    let index = ratingsArray.findIndex( x => (x._id.toString() === ratedUser._id.toString()))
    req.body.score = parseInt(req.body.score)
    if(index > -1) {
      //Checks to see if there is already a rating
      //Case 1: remove the rating (if same integer)
      if(ratingsArray[index].score === req.body.score) ratingsArray.splice(index, 1);
      //Case 2: Update rating (if new integer)
      else ratingsArray[index].score = req.body.score
    }
    else ratingsArray.push(newRating);
    loggedInUser.save();
    res.json(ratingsArray);
  }
  catch(e){
    console.log(e)
    res.json(e)
  }
}

exports.editProfile = async function(req, res){
  try {
    let newData = req.body
     //Prevent trying to change password here, there's a better way to fix this surely but I can't find it.
    newData.password && delete newData.password
      let user =
        await db.User.findOneAndUpdate
        (
          {_id: mongoose.Types.ObjectId(res.locals.user)},
          {$set: newData},
          {new: true}
        )
      res.status(200).json(user) //Send new update data TODO
  }
  catch(e){
    console.log("something is wrong: "  + e)
    res.json(e);
  }
}


exports.search = async function(req, res){
  let urlQueries = req.query
  // console.log(urlQueries.name)
  // let query = {};


  let query
  if(urlQueries.hasOwnProperty("name")) returned = await db.User.find({username: {$regex: urlQueries['name'], $options: "i"}})
   .limit(parseInt(urlQueries["limit"]))
   res.send(returned);
  // if(urlQueries.hasOwnProperty("interests")) query = {"userDetails.interests": {$regex: urlQueries['interests'], $options: "i"}};
  // if(urlQueries.hasOwnProperty("languages")) query = {"userDetails.languages": {$regex: urlQueries['languages'], $options: "i"}};
  //
  if(urlQueries.hasOwnProperty("languages")) query = "languages";
  if(urlQueries.hasOwnProperty("interests")) query = "interests"
  try{
  let returned = await db.User.aggregate([
        {
          $match:{["userDetails." + query]: {$regex: urlQueries[query], $options: "i"}}
        },
        {
          $unwind: "$userDetails." + query
        },
        {
          $match:{["userDetails." + query]: {$regex: urlQueries[query], $options: "i"}}
        },
        {
          $group:{
          _id:"$userDetails." + query,
          users: {$push: "$username"}
          }
        },
        {
          $project: {
            _id: 0,
            "result": "$_id",
            "users": "$users"
          }
        }

  ])
  res.json(returned)
  }
  catch(e){
    res.json(e)
  }

  // OLD //


  // if(urlQueries.length < 1) throw {code: 400, details: "Please enter a query!"}
  //  let returned = await db.User.find(query)
  //  .limit(parseInt(urlQueries["limit"]))
  //  res.send(returned);

//   let returned = await db.User.aggregate([
//     {"userDetails.languages": {$regex: urlQueries['languages'], $options: "i"}},
//     {$project: {
//       users: {$filter:{
//         input: "$users",
//         as:"users",
//         cond:{$eq: ["$$users.userDetails.languages", {$regex: urlQueries['languages'], $options: "i"}]}
//       }}
//     }}
// ])

}


module.exports = exports;
