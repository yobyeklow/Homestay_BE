import Booking from "../model/booking.js";
import Customer from "../model/customer.js";
import Payment from "../model/payment.js";

// Controller for revenue statistics
const revenueController = {
  getByMonth: async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      const monthlyRevenue = await Payment.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $year: "$paymentDate" }, year] },
                { $eq: [{ $month: "$paymentDate" }, month] },
              ],
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$paymentDate" },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({ monthlyRevenue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get revenue by year with monthly breakdown
  getByYear: async (req, res) => {
    try {
      const year = parseInt(req.params.year);

      const yearlyRevenue = await Payment.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $year: "$paymentDate" }, year],
            },
          },
        },
        {
          $group: {
            _id: { $month: "$paymentDate" },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({ yearlyRevenue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllRevenueFromTheStartDateToEndDate: async (req, res) => {
    const { customerID } = req.params;
    const { dateFrom, dateTo } = req.query;

    const existCustomer = await Customer.findById({ _id: customerID });

    if (!existCustomer && existCustomer.role !== "host") {
      return res.status(404).json({ error: "Tài khoản không tìm thấy" });
    }

    try {
      const data = await Payment.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $gte: ["$paymentDate", new Date(dateFrom)] },
                { $lte: ["$paymentDate", new Date(dateTo)] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingID",
            foreignField: "_id",
            as: "booking",
          },
        },
        {
          $lookup: {
            from: "houses",
            localField: "booking.houseID",
            foreignField: "_id",
            as: "house",
          },
        },
        {
          $lookup: {
            from: "hosts",
            localField: "house.hostID",
            foreignField: "_id",
            as: "host",
          },
        },
      ]);

      const sumCompletedRevenue = data
        .map((item) => {
          if (
            item.booking[0].bookingStatus === "Đã hoàn thành" &&
            item.host[0].customerID.toString() === customerID
          )
            return item.amount;
        })
        .reduce((a, b) => a + b, 0);

      const completedBooking = data.filter((item) => {
        if (
          item.booking[0].bookingStatus === "Đã hoàn thành" &&
          item.host[0].customerID.toString() === customerID
        )
          return item;
      });

      const canceledBooking = data.filter((item) => {
        if (
          item.booking[0].bookingStatus === "Đã hủy" &&
          item.host[0].customerID.toString() === customerID
        )
          return item;
      });

      res.json({
        sumCompletedRevenue,
        canceledBookings: canceledBooking.length,
        completedBookings: completedBooking.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default revenueController;
