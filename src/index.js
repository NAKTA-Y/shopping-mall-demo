const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/products", require("./routes/products"));
app.use("/cart", require("./routes/cart"));
app.use("/orders", require("./routes/orders"));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "요청한 경로를 찾을 수 없습니다." });
});

app.listen(PORT, () => {
  console.log(`Shopping Mall API running on port ${PORT}`);
});
