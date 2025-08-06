const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    products: {
      type: [
        {
          product_id: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          width: {
            type: Number,
            required: true,
          },
          height: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          selling_price: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    total_price: {
      type: Number,
      required: true,
    },
    extra_services: {
      type: [
        {
          service_amount: {
            type: Number,
            required: true,
            min: 0,
          },
          service_name: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    payment_log: {
      type: [
        {
          payment_amount: {
            type: Number,
            required: true,
          },
          payment_method: {
            type: String,
            required: true,
            enum: ["cash", "card"],
          },    
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },  
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
