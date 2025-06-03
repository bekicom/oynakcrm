const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    area: { type: Number, default: 0 },
    unit_area: { type: Number, default: 0 },
    purchase_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    from: { type: String, required: true },
    currency: {
      type: String,
      enum: ["USD", "SUM"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Kvadrat metrni hisoblash
// productSchema.pre("save", function (next) {
//   this.area = this.width * this.height * this.quantity;
//   this.unit_area = this.width * this.height
//   next();
// });

module.exports = mongoose.model("Product", productSchema);
