import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import morgan from 'morgan';
import authRoute from './routes/auth.js'

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
//
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});
