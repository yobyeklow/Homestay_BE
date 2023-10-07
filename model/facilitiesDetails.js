import { Schema, model } from "mongoose";

const facilitiesDetailSchema = new Schema(
  {
    facilityName: {
      type: String,
      require: true,
    },
    amount: { type: Number, default: 0 },
    facilityTypeID: { type: Schema.Types.ObjectId, ref: "FacilitiesType" },
  },
  { timestamps: true }
);

const FacilitiesDetail = model("FacilitiesDetail", facilitiesDetailSchema);
export default FacilitiesDetail;
