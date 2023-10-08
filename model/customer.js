import mongoose from "mongoose";
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Vui lòng nhập tên của bạn"],
      max: [20, "Tên không vượt quá 20 ký tự"],
    },
    photo: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      unique: true,
      match: [/(0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không đúng"],
    },
    birthDay: {
      type: Date,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Địa chỉ email là bắt buộc"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập địa chỉ email",
      ],
    },
    password: {
      type: String,
      required: true,
      min: [8, "Mật khẩu phải có ít nhất 8 ký tự"],
      max: [20, "Mật khẩu không vượt quá 20 ký tự"],
    },
    role: {
      type: String,
      enum: ["customer", "host"],
      default: "customer",
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ"],
    },
    paymentType: { type: String, default: "" },
    cardNumber: { type: String, default: "" },
    securityCode: { type: String, default: "" },
    nameOnCard: { type: String, default: "" },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
