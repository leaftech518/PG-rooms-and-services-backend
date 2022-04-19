const express = require("express");
const app = express();
const errormiddleware = require("../Backend/middleware/error");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const productRoute =require("./routes/productRoute");
const userRoute = require("../Backend/routes/userRoute");


app.use("/api/v1",productRoute);
app.use("/api/v1",userRoute);

app.use(errormiddleware);



module.exports = app;

