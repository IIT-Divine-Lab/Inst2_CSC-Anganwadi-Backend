const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

function connection(uri) {
   mongoose
      .connect(uri)
      .then(() => console.log("Database Connected..."))
      .catch((err) => console.log("Could not connect to Database. ", err.message));
}

module.exports = connection; 