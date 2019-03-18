const jwt = require("jsonwebtoken");

exports.loginRequired = function(req, res, next){
  try {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.AUTH_KEY, function(err, auth){
      if(auth){
        res.locals.user = auth;
        console.log(auth._id)
        next();
      }
      else{
        throw {code: 401, details: "Sorry, you are not logged in! "}
      }
    });
  }
  catch(e){
    res.status(e.code).json(e)
  }
}


exports.ensureCorrectUser = function(req, res, next){
  try{
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.AUTH_KEY, function(err, auth){
      if(auth && auth.username === req.params.id){
        next();
      }
      else{
        throw {code: 403, details: "Sorry, you don't have permission to do that! "}
      }
    })
  }catch(e){
    res.status(e.code).json(e)
  }
}
