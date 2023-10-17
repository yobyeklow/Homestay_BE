import { Schema, model } from "mongoose";

const refundSchema = new Schema(
  {
    paymentID: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    refundDate: {
      type: Date,
      required: true,
    },
    tax: {
      type: Number,
    },
    total: {
      type: Number,
      default: 15,
    },
    reasonRefund: { type: String, default: "" },
  },
  { timestamps: true }
);

const Refund = model("Refund", refundSchema);
export default Refund;
