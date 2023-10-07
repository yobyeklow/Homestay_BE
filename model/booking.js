import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    house: {
      type: Schema.Types.ObjectId,
      ref: "House",
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    updateDate: {
      type: Date,
    },
    bookingStatus: {
      type: String,
      enum: ["Đã hủy", "Đang xử lý", "Hoàn thành"],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 5,
    },
    guestNumber: [
      {
        type: Schema.Types.ObjectId,
        ref: "Guest",
      },
    ],
  },
  { timestamps: true }
);

const Booking = new model("Booking", bookingSchema);
export default Booking;
