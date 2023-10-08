import { Schema, model } from "mongoose";

const guestSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      require: [true, "BookingID can not be empty"],
    },
    guestType: {
      type: String,
    },
    guestNumber: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Guest = model("Guest", guestSchema);
export default Guest;
