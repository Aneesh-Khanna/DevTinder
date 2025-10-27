require("dotenv").config();
const express = require("express"); // import express
const { connectDB } = require("./config/database"); // import db connection config
const app = express(); // create web server
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors"); // to handle cors error
const http = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "https://dev-tinder-kappa-seven.vercel.app", // Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, etc
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS not allowed"), false);
      }
      return callback(null, true);
    },
    credentials: true, // important for cookies
  })
); // to avoid cors error
app.use("/", express.json()); // middleware to get json data from req at all routes
app.use(cookieParser()); // middle to read cookie from req at all routes

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

// Db connection and making server listen
connectDB()
  .then(() => {
    console.log("Database connection established...");

    // if db connected then only start the server

    server.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on port 3001....");
    }); // making server listen to requests
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });
