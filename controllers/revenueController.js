import Booking from "../model/booking.js";
import Customer from "../model/customer.js";
import Payment from "../model/payment.js";

// Controller for revenue statistics
const revenueController = {
  getByMonth: async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const { customerID } = req.params;

      const existCustomer = await Customer.findById({ _id: customerID });

      if (!existCustomer && existCustomer.role !== "host") {
        return res.status(404).json({ error: "Tài khoản không tìm thấy" });
      }
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
      
      const result = monthlyRevenue.map((item) => item.totalAmount)

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
      const { customerID } = req.params;

      const existCustomer = await Customer.findById({ _id: customerID });

      if (!existCustomer && existCustomer.role !== "host") {
        return res.status(404).json({ error: "Tài khoản không tìm thấy" });
      }
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
      const data = Array.from({ length: 12 }, (_) => 0);
      yearlyRevenue.forEach((item) => {
        data[item._id - 1] = item.totalAmount;
      });

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get all revenue from the start date to the end date
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
            pipeline: [
              {
                $project: {
                  _id: 1,
                  bookingStatus: 1,
                  houseID: 1,
                  customerID: 1,
                  checkInDate: 1,
                  checkOutDate: 1,
                  totalPrice: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "booking.customerID",
            foreignField: "_id",
            as: "customer",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  photo: 1,
                  phoneNumber: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "houses",
            localField: "booking.houseID",
            foreignField: "_id",
            as: "house",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  hostID: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "hosts",
            localField: "house.hostID",
            foreignField: "_id",
            as: "host",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  customerID: 1,
                },
              },
            ],
          },
        },
      ]);

      // Get sum of completed revenue
      const sumCompletedRevenue = data
        .map((item) => {
          if (
            item.booking[0]?.bookingStatus === "Hoàn thành" &&
            item.host[0].customerID.toString() === customerID
          )
            return item.booking[0]?.totalPrice || 0;
        })
        .reduce((a, b) => {
          return b ? a + b : a;
        }, 0);

      const completedBooking = data.filter((item) => {
        if (
          item.booking[0]?.bookingStatus === "Hoàn thành" &&
          item.host[0].customerID.toString() === customerID
        )
          return item;
      });

      // Get sum of canceled revenue
      const canceledBooking = data.filter((item) => {
        if (
          item.booking[0]?.bookingStatus === "Đã huỷ" &&
          item.host[0].customerID.toString() === customerID
        )
          return item;
      });

      const customersData = data
        .map((item) => item.customer)
        .flatMap((item) => item);

      // Create a Set from the array of objects
      const uniqueIds = new Set(
        customersData.map((customer) => customer._id.toString())
      );

      // Filter out the duplicate objects
      const duplicatedCustomers = customersData.filter((customer) => {
        if (uniqueIds.has(customer._id.toString())) {
          uniqueIds.delete(customer._id.toString());
          return true;
        }
        return false;
      });

      // Return results
      res.status(200).json({sumCompletedRevenue,canceledBookings: canceledBooking.length,completedBookings: completedBooking.length,customers: duplicatedCustomers,});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default revenueController;
