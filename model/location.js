import { Schema, model } from "mongoose";

const locationSchema = new Schema(
  {
    city: {
      type: String,
      required: [true, "Thành phố không được để trống"],
      maxLength: [100, "Phải ít hơn hoặc bằng 100 ký tự."],
    },
    streetAddress: {
      type: String,
      required: [true, "Địa chị không được để trống"],
      maxLength: [150, "Phải ít hơn hoặc bằng 150 ký tự."],
    },
    zipCode: {
      type: String,
      maxLength: [6, "Phải ít hơn hoặc bằng 6 ký tự."],
    },
    coordinates: {
      type: Schema.Types.ObjectId,
      ref: "Coordinate",
    },
  },
  { timestamps: true }
);

const Location = model("Location", locationSchema);
export default Location;
