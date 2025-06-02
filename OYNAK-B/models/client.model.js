const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },

    // 🔽 Qarzdorliklar ro‘yxati
    debts: [
      {
        product_name: String,
        quantity: Number,
        price: Number,
        total: Number,
        paid_amount: { type: Number, default: 0 },
        due_date: Date,
        status: {
          type: String,
          enum: ["unpaid", "paid", "active"], // 🔄 "active" qo‘shildi
          default: "unpaid"
        }
        
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
