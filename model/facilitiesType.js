import { Schema, model } from "mongoose";

const facilitiesSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    facilitiesDetail: [
      {
        type: Schema.Types.ObjectId,
        ref: "FacilitiesDetail",
      },
    ],
  },
  { timestamps: true }
);

const FacilitiesType = model("FacilitiesType", facilitiesSchema);
export default FacilitiesType;
