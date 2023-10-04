const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserID can not be empty"],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "ListingID can not be empty"],
    },
    languages: [
      {
        type: String,
      },
    ],
    bankName: {
      type: String,
    },
    bankNumber: {
      type: String,
    },
    swiftCode: {
      type: String,
    },
    NameOnCard: {
      type: String,
    },
  },
  { timestamps: true }
);

const Host = mongoose.model("Host", hostSchema);
module.exports = Host;
