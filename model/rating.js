import { Schema, model } from "mongoose";

const ratingSchema = new Schema(
  {
    ratingPoint: {
      type: Number,
      required: true,
    },
    ratingDescription: {
      type: String,
      required: true,
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    houseID: {
      type: Schema.Types.ObjectId,
      ref: "House",
    },
  },
  { timestamps: true }
);

const Rating = model("Rating", ratingSchema);
export default Rating;
