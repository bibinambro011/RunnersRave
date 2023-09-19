const mongoose=require("mongoose")


const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};


 const connectToDatabase = () => {
    mongoose
  .connect("mongodb://127.0.0.1:27017/runnersRave",{useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });
  };

  module.exports={connectToDatabase}