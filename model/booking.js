import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    houseID: {
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
    bookingStatus: {
      type: String,
      enum: ["Đã hủy", "Đang xử lý", "Hoàn thành"],
      default: "Đang xử lý",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 8,
    },
    guestID: [
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
