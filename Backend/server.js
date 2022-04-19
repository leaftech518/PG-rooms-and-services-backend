const app = require("./app");

const dotenv = require("dotenv");
const database  = require("./config/database");
const connectDatabase = require("./config/database");

//handling uncaught exceptions
process.on("uncaughtException",(bug)=>{
    console.log(`Error: ${bug.message}`);
   console.log(`Shutting down the server due to uncaught Exception`);
     process.exit(1);
});


dotenv.config({path:"Backend/config/config.env"});

connectDatabase();


const server = app.listen(process.env.PORT,()=> {
    console.log(`server is live on http://localhost:${process.env.PORT}`);
});

// unhandled promise rejection

process.on("unhandledRejection",(error) =>{
    console.log(`Error: ${error.message}`);
    console.log(`Shutting down server due to unhandled Promise rejection`);

    server.close(() =>{
        process.exit(1);
    });
});