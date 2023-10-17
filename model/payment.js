import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    bookingID: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    tax: { type: Number, default: 8 },
    isRefund: { type: Boolean, default: true },
    isFreeRefund: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Payment = model("Payment", paymentSchema);
export default Payment;
