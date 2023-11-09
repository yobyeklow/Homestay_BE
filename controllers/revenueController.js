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
};

export default revenueController;
