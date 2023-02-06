const mongoose = require("mongoose");

const connectToDatabase = () => {
  mongoose
    .connect(process.env.DB_LOCAL_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(`Mongodb Database with host : ${con.connection.host}`);
    });
};
 module.exports = connectToDatabase