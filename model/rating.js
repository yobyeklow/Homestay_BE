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
    customerID: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    houseID: {
      type: Schema.Types.ObjectId,
      ref: "House",
    },
    bookingID: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  { timestamps: true }
);

const Rating = model("Rating", ratingSchema);
export default Rating;
