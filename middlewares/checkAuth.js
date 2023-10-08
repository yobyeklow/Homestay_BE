import jwt from "jsonwebtoken";
import Customer from "../model/customer.js";
import Host from "../model/host.js";

export const checkAuthentication = (req, res, next) => {
  try {
    const { accessToken } = req.signedCookies;

    jwt.verify(accessToken, process.env.JWT_SECRET, async (err, result) => {
      if (err) {
        res.clearCookie("accessToken");
        return res
          .status(403)
          .json({ error: "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại." });
      }
      const customer = await Customer.findOne({ _id: result.id });
      if (!customer) {
        res.clearCookie("accessToken");
        return res
          .status(404)
          .json({ error: "Tài khoản hiện tại của bạn không tồn tại." });
      }
      req.user = customer;
      next();
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const checkAuthenticationHost = async (req, res, next) => {
  try {
    const { accessToken } = req.signedCookies;

    jwt.verify(accessToken, process.env.JWT_SECRET, async (err, result) => {
      if (err) {
        res.clearCookie("accessToken");
        return res
          .status(403)
          .json({ error: "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại." });
      }

      const isHost = await Customer.findOne({ _id: result.id, role: "host" });
      if (!isHost) {
        return res.status(400).json({
          error: "Vui lòng đăng ký trở thành người cho thuê",
        });
      }

      const existingHost = await Host.findOne({ customerID: result.id });

      if (!existingHost) {
        return res.status(400).json({ msg: "Không tìm thấy tài khoản" });
      }

      const customer = await Customer.findOne({ _id: result.id });
      if (!customer) {
        res.clearCookie("accessToken");
        return res
          .status(404)
          .json({ error: "Tài khoản hiện tại của bạn không tồn tại." });
      }
      req.user = customer;
      next();
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
