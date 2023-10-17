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
    refundStatus: {
      type: String,
      enum: ["Đã hoàn tiền", "Đang xử lý"],
      default: "Đang xử lý",
    },
  },
  { timestamps: true }
);

const Refund = model("Refund", refundSchema);
export default Refund;
