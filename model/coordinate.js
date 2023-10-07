import { Schema, model } from "mongoose";

const coordinateSchema = new Schema(
  {
    x: {
      type: Number,
      required: [true, "Vĩ độ không thể để trống."],
    },
    y: {
      type: Number,
      required: [true, "Kinh độ không thể để trống."],
    },
  },
  { timestamps: true }
);

const Coordinate = model("Coordinate", coordinateSchema);
export default Coordinate;
