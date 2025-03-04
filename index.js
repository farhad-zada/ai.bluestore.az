import express from "express";
import session from "express-session";
import ai from "./routes/ai.js";
import { config } from "dotenv";
config();
const app = express();

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 48 * 60 * 60 * 1000, // Session expires after 48 hours
    },
  })
);

app.use(express.static(`./static`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/session", ai);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
