import Customer from "../model/customer.js";
import Host from "../model/host.js";

const hostController = {
  // Đăng ký trở thành chủ cho thuê
  registerBecomeHost: async (req, res) => {
    try {
      const { customerID } = req.params;

      const existingCustomer = await Customer.findOne({ _id: customerID });

      if (!existingCustomer)
        return res
          .status(400)
          .json({ msg: "Khách hàng này không tồn tại. Có thể đã bị xóa!" });

      const existingHost = await Host.findOne({ customerID: customerID });
      if (existingHost)
        return res.status(400).json({ msg: "Khách hàng đã là người cho thuê" });

      await Customer.findByIdAndUpdate({ _id: customerID }, { role: "host" });

      await Host.create({
        customerID: existingCustomer._id,
      });

      res
        .status(200)
        .json({ msg: "Bạn đã trở thành người cho thuê thành công!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updatePaymentInfoForHost: async (req, res) => {
    try {
      const { hostID } = req.params;
      const { bankName, bankNumber, swiftCode, nameOnCard } = req.body;

      const existingHost = await Host.findOne({ _id: hostID });

      if (!existingHost) {
        return res
          .status(400)
          .json({ msg: "Tài khoản người cho thuê không tồn tại" });
      }

      await Host.findOneAndUpdate(
        { _id: hostID },
        {
          $set: {
            bankName,
            bankNumber,
            swiftCode,
            nameOnCard,
          },
        }
      );

      res.status(200).json({ msg: "Cập nhật thành công" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

export default hostController;
