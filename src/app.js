const express = require("express"); // import express
const app = express(); // create web server

// request handling
app.use((req,res)=>{res.send("hello from server")});

app.listen(3001 , () => {
    console.log("Server is successfully listening on port 3001....");
}) // making server listen to requests