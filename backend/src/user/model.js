const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true, 
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    reset:{
      code:{
        type:String,
        default:null
      },
      time:{
        type:Date,
        default:null
      }
    }
  },
  {
    collection: "User",
    timestamps: true, 
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
