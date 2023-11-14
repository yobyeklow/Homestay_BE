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
import bookingRoute from "./routes/bookingRoute.js";
import revenueRoute from "./routes/revenueRoute.js";
import handleRunUpdateAll from "./handleRunUpdateAll.js";

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

// Routes
app.use("/api", authRoute);
app.use("/api", hostRoute);
app.use("/api", houseRoute);
app.use("/api", bookingRoute);
app.use("/api", revenueRoute);
//
const port = process.env.PORT || 8000;

const start = async () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Connected to Mongoose");
    })
    .catch((err) => console.log(err));

  app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
  });

  await handleRunUpdateAll.handleRunUpdateBoookingStatusCompleted();
  await handleRunUpdateAll.handleRunUpdateCalendarStatus();
};

start();
