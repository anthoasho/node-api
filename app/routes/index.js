let router        = require("express").Router();
let auth          = require("../middleware/authentication");
let userRoutes    = require("./user_routes");
let authRoutes    = require("./auth_routes");



/*USER*/
router.get("/", function(req, res){res.send("Welcome")})
router.post("/user", userRoutes.newUser);
router.get("/user", userRoutes.getUsers);
router.post("/user/:id", auth.loginRequired, userRoutes.userIdPost);
router.get("/user/:id", userRoutes.userIdGet);
router.post("/user/edit", auth.loginRequired, userRoutes.editProfile);
router.get("/search", userRoutes.search);

/*AUTHENTICATION*/
router.post("/login", authRoutes.login);

module.exports = router;
