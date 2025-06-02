require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ qo‘shildi
const router = require("./routes/router");

const app = express();

// ✅ CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // frontend domeni
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", router);

// MongoDB ulanish
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB ulandi ✅"))
  .catch((err) => console.error("MongoDB xatosi ❌", err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
});
