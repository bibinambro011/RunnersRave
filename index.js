
const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const db =require("./config/connection")
const userRoute = require("./route/userRoute");
const adminroutes = require("./route/adminRoute");
const nocache = require("nocache");
const loger = require("morgan");
const controller = require("./controller/userController")


const sessions = require("express-session");
const { v4: uuidv4 } = require("uuid");

const publicfolder = path.join(__dirname + "/assets");
console.log(publicfolder);

app.use(loger("dev"));

app.use(
  sessions({
    secret: uuidv4(),
    saveUninitialized: true,

    resave: false,
  })
);
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicfolder));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/", userRoute);
app.use("/admin", adminroutes);


db.connectToDatabase()
app.listen(3000,()=>{
    console.log("connected succesfully");
});
