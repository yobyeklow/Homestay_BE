import createToken from "../utils/createToken.js"
import Customer from "../model/customer.js";
import bcrypt from 'bcrypt'
import validate from "../utils/validate.js";
import jwt from 'jsonwebtoken'

const authController = {
  registerCustomer: async (req, res) => {
    try {
      const {email, phoneNumber, name, password} = req.body;

      const err = validate.validateBeforeRegister(req.body);
      if (Object.keys(err).length > 0) {
          return res.status(400).json({ msg: Object.values(err)[0] });
      }

      const existingCustomer = await Customer.findOne({email})
      if(existingCustomer) return res.status(400).json({msg: "Email đã tồn tại!"})

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      //Create customer

      await Customer.create({
        email: email,
        password: hashed,
        phoneNumber: phoneNumber,
        name: name,
      })

      return res.status(200).json({msg: "Đăng ký tài khoản thành công"});
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  loginCustomer: async (req, res) => {
    try {
      const {email, password} = req.body

      const err = validate.validateBeforeLogin(req.body);
      if (Object.keys(err).length > 0) {
        return res.status(400).json({ msg: Object.values(err)[0] });
      }

      const customer = await Customer.findOne({ email });

      if (!customer) {
        return res.status(400).json("Tài khoản không tồn tại");
      }

      const validPassword = await bcrypt.compare(
        password,
        customer.password
      );

      if (!validPassword) {
        return res.status(400).json("Mật khẩu không đúng!");
      }
      if (customer && validPassword) {
        const accessToken = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        const refreshToken = jwt.sign({ id: customer._id }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '365d' })

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
        });

        const { password, ...others } = customer._doc;
        return res.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  refreshToken: async (req, res) => {
    const refreshToken = req.cookie.refreshToken;
    if (!refreshToken) {
      return res.status(401).json("Bạn chưa đăng nhập!");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
      if (err) {
        console.log(err);
      }
      const newToken = createToken(user);
      const newAccessToken = newToken.accessToken;
      const newRefreshToken = newToken.refreshToken;
      res.cookies("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
      });
      return res.status(200).json({ accessToken: newAccessToken });
    });
  },

  logout: async (req, res) => {
    res.clearCookie("refreshToken");
    return res.status(200).json("Đăng xuất thành công");
  },
};

export default authController