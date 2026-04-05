const express = require("express");
const mongoose = require("mongoose");
const validator = require("validator");
const cors = require("cors");

const encodeBase62 = require("./base62");

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// TODO: replace with your own MongoDB connection string
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  clicks: { type: Number, default: 0 },
});

const Url = mongoose.model("Url", urlSchema);

app.post("/api/urls", async (req, res) => {

  const originalUrl = req.body.originalUrl;

  if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }
  if (!validator.isURL(originalUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  //url exists in db, return
  const existing = await Url.findOne({ originalUrl });
  if (existing) {
    return res.json(existing);
  }

  const shortCode = encodeBase62(Date.now());

  const newUrl = await Url.create({
    originalUrl,
    shortCode,
  });

  res.json(newUrl);
});

app.get("/api/urls", async (req, res) => {
  const urls = await Url.find();
  res.json(urls);
});

app.get("/api/urls/:id", async (req, res) => {
  const url = await Url.findById(req.params.id);
  res.json(url);
});

app.get("/:shortCode", async (req, res) => {
  const url = await Url.findOne({ shortCode: req.params.shortCode });

  if (!url) {
    return res.send("Not found");
  }

  url.clicks += 1;
  await url.save();

  res.redirect(url.originalUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
