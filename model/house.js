import { Schema, model } from "mongoose";

const houseSchema = new Schema(
  {
    locationID: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    roomID: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    calenderID: { type: Schema.Types.ObjectId, ref: "Calendar" },
    facilityTypeID: [{ type: Schema.Types.ObjectId, ref: "FacilitiesType" }],
    hostID: { type: Schema.Types.ObjectId, ref: "Host" },
    numberGuest: { type: Number, default: 0 },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    costPerNight: { type: Number, default: 0 },
    images: { type: Array, default: [] },
    bedCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const House = model("House", houseSchema);
export default House;
