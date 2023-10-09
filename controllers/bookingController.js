import Booking from "../model/booking.js";
import Calendar from "../model/calendar.js";
import Guest from "../model/guests.js";
import House from "../model/house.js";

const bookingController = {
  bookingHouseStay: async (req, res) => {
    try {
      const { houseID, customerID } = req.params;
      const { guests, checkInDate, checkOutDate } = req.body;

      // Input validation
      if (!guests || !checkInDate || !checkOutDate) {
        return res.status(400).json({ msg: "Vui lòng cung cấp đủ thông tin" });
      }

      // Find the existing house and calendar
      const existingHouse = await House.findOne({ _id: houseID });
      const calendar = await Calendar.findOne({ houseID: houseID });

      if (!existingHouse) {
        return res
          .status(400)
          .json({ msg: "Housestay này không còn tồn tại." });
      }

      // Convert dates to Date objects
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const dateFrom = new Date(calendar.dateFrom);
      const dateTo = new Date(calendar.dateTo);

      // Check if the booking dates are valid
      if (
        checkIn < dateFrom ||
        checkIn > dateTo ||
        checkOut < dateFrom ||
        checkOut > dateTo
      ) {
        return res.status(400).json({ msg: "Lỗi! Vui lòng thử lại" });
      }

      // Calculate total price
      const countNight = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
      const totalPrice =
        countNight * existingHouse.costPerNight +
        countNight * existingHouse.costPerNight * 0.08;

      // Create a booking
      const booking = await Booking.create({
        houseID,
        customerID,
        checkInDate,
        checkOutDate,
        totalPrice,
      });

      // Create guest entries and get their IDs
      const guestIDs = await Promise.all(
        guests.map(async (guest) => {
          const result = await Guest.create({
            bookingID: booking._id,
            guestNumber: guest.guestNumber,
            guestType: guest.guestType,
          });
          return result._id;
        })
      );

      // Update the booking with guest IDs
      await Booking.findOneAndUpdate(
        { _id: booking._id },
        { $push: { guestID: { $each: guestIDs } } }
      );

      await Calendar.findOneAndUpdate(
        { _id: calendar._id },
        { $set: { available: false } }
      );

      return res.status(200).json({ msg: "Booking thành công" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateCompletedStatusBooking: async (req, res) => {
    try {
      const { bookingID } = req.params;
      const existingBooking = await Booking.findOne({ _id: bookingID });

      if (!existingBooking)
        res
          .status(400)
          .json({ msg: "Không tìm thấy. Booking có thể đã bị xóa." });

      await Booking.findOneAndUpdate(
        { _id: bookingID },
        {
          $set: {
            bookingStatus: "Hoàn thành",
          },
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateCanceledStatusBooking: async (req, res) => {
    try {
      const { bookingID } = req.params;
      const existingBooking = await Booking.findOne({ _id: bookingID });

      if (!existingBooking)
        res
          .status(400)
          .json({ msg: "Không tìm thấy. Booking có thể đã bị xóa." });

      await Booking.findOneAndUpdate(
        { _id: bookingID },
        {
          $set: {
            bookingStatus: "Đã hủy",
          },
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
export default bookingController;
