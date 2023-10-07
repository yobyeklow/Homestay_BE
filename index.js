import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.js";
import hostRoute from "./routes/hostRoute.js";
import houseRoute from "./routes/houseRoute.js";

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan("common"));

//connect database

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to Mongoose");
  })
  .catch((err) => console.log(err));

// Routes
app.use("/api", authRoute);
app.use("/api", hostRoute);
app.use("/api", houseRoute);
//
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});
