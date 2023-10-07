import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    houseID: { type: Schema.Types.ObjectId, ref: "House" },
    name: {
      type: String,
      maxLength: [40, "Phải ít hơn 40 ký tự."],
      required: true,
    },
    bedCount: {
      type: Number,
      default: 0,
    },
    type: { type: String, default: "" },
  },
  { timestamps: true }
);

const Room = model("Room", roomSchema);
export default Room;
