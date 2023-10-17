import Booking from "../model/booking.js";
import Calendar from "../model/calendar.js";
import Guest from "../model/guests.js";
import House from "../model/house.js";
import Payment from "../model/payment.js";
import Refund from "../model/refund.js";

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

      const totalPrice = countNight * existingHouse.costPerNight;
      const amountPayment =
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

      const createPayment = await Payment.create({
        bookingID: booking._id,
        amount: amountPayment,
        paymentDate: Date.now(),
      });

      const updateBooking = Booking.findOneAndUpdate(
        { _id: booking._id },
        {
          $push: {
            guestID: { $each: guestIDs },
            paymentID: createPayment._id,
          },
        }
      );

      const updateCalendar = Calendar.findOneAndUpdate(
        { _id: calendar._id },
        { $set: { available: false } }
      );

      await Promise.all([updateBooking, updateCalendar]);

      return res.status(200).json({ msg: "Booking thành công" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateCompletedStatusBooking: async (req, res) => {
    try {
      const { bookingID, hostID } = req.params;
      const existingBooking = await Booking.findOne({ _id: bookingID });

      if (!existingBooking)
        res
          .status(400)
          .json({ msg: "Không tìm thấy. Booking có thể đã bị xóa." });

      const house = await House.findOne({
        _id: existingBooking.houseID,
      });

      if (!house)
        return res.status(400).json({ msg: "Housestay không tồn tại." });

      if (house.hostID.toString() !== hostID)
        return res.status(404).json({ msg: "Bạn không có quyền cập nhật." });

      await Booking.findOneAndUpdate(
        { _id: bookingID },
        {
          $set: {
            bookingStatus: "Hoàn thành",
          },
        }
      );

      res.status(200).json({ msg: "Cập nhật thành công." });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  cancelBookingByCustomer: async (req, res) => {
    try {
      const { bookingID, paymentID } = req.params;
      const existingBooking = await Booking.findOne({ _id: bookingID });
      const existingPayment = await Payment.findOne({ _id: paymentID });

      if (!existingBooking)
        res
          .status(400)
          .json({ msg: "Không tìm thấy. Booking có thể đã bị xóa." });

      if (!existingPayment)
        res.status(400).json({ msg: "Lỗi vui lòng thử lại." });

      const updateBooking = Booking.findOneAndUpdate(
        { _id: bookingID },
        {
          $set: {
            bookingStatus: "Đã hủy",
          },
        }
      );

      const createRefund = Refund.create({
        paymentID: existingPayment._id,
        refundDate: Date.now(),
        total: existingPayment.amount - existingPayment.amount * 0.15,
      });

      await Promise.all([updateBooking, createRefund]);

      res.status(200).json({ msg: "Hủy booking thành công" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getAllBookingsOfHost: async (req, res) => {
    try {
      const { hostID } = req.params;

      const results = await Booking.find()
        .populate({
          path: "houseID",
          model: "House",
          select: "_id hostID title description costPerNight images",
          match: { hostID: hostID },
        })
        .populate({
          path: "customerID",
          model: "Customer",
          select: "_id name phoneNumber",
        })
        .populate({
          path: "guestID",
          model: "Guest",
          select: "_id guestType guestNumber",
        })
        .populate({
          path: "paymentID",
          model: "Payment",
          select: "_id amount paymentDate tax",
        });

      const filteredBookings = results.filter((booking) => {
        return booking.houseID !== null;
      });

      res.status(200).json({ bookings: filteredBookings });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
export default bookingController;
