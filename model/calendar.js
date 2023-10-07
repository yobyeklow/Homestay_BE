import { Schema, model } from "mongoose";

const calendarSchema = new Schema(
  {
    houseID: { type: Schema.Types.ObjectId, ref: "House" },
    available: { type: Boolean, default: true },
    dateFrom: { type: Date },
    dateTo: { type: Date },
  },
  { timestamps: true }
);

const Calendar = model("Calendar", calendarSchema);
export default Calendar;
