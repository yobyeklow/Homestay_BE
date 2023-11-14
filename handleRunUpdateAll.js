import mongoose from "mongoose";
import Booking from "./model/booking.js";
import Calendar from "./model/calendar.js";

const handleRunUpdateAll = {
  handleRunUpdateBoookingStatusCompleted: async () => {
    try {
      const URI = process.env.MONGODB_URL || "";
      if (mongoose.connection.readyState === 0) {
        mongoose.connect(
          URI,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          },
          (err) => {
            if (err) throw err;
          }
        );
      }

      const currentDate = new Date();

      await Booking.updateMany(
        {
          checkOutDate: { $lt: currentDate.toISOString() },
        },
        { bookingStatus: "Hoàn thành" }
      );
    } catch (error) {
      console.log(
        "🚀 ~ file: handleRunUpdateAll.js:5 ~ handleRunUpdateBoookingStatusCompleted ~ error:",
        error
      );
    }
  },

  handleRunUpdateCalendarStatus: async () => {
    try {
      const URI = process.env.MONGODB_URL || "";
      if (mongoose.connection.readyState === 0) {
        mongoose.connect(
          URI,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          },
          (err) => {
            if (err) throw err;
          }
        );
      }

      const currentDate = new Date();

      await Calendar.updateMany(
        {
          dateTo: { $lt: currentDate.toISOString() },
        },
        { available: true }
      );
    } catch (error) {
      console.log(
        "🚀 ~ file: handleRunUpdateAll.js:63 ~ handleRunUpdateCalendarStatus: ~ error:",
        error
      );
    }
  },
};

export default handleRunUpdateAll;
