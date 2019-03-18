const mongoose = require("mongoose");
const connect = mongoose.connect(process.env.MONGOD, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
 useNewUrlParser: true
});

module.exports.User = require("./user");
