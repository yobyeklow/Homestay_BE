import { Schema, Types, model } from "mongoose";

const hostSchema = new Schema(
  {
    customerID: { type: Types.ObjectId, ref: "Customer" },
    bankName: { type: String, default: "" },
    bankNumber: { type: String, default: "" },
    swiftCode: { type: String, default: "" },
    nameOnCard: { type: String, default: "" },
  },
  { timestamps: true }
);

const Host = model("Host", hostSchema);
export default Host;
