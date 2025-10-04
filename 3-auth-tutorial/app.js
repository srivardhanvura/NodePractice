import express from "express";
import "dotenv/config";
import authRouter from "./auth.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post("/login", (req, res) => {
  res.json({ message: "home" });
});

app.use("/auth", authRouter);

app.listen(5000);
