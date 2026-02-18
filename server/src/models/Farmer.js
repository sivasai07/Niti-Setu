const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
    transcript: String,
    state: String,
    district: String,
    land_holding_acres: Number,
    crop_type: String,
    social_category: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Farmer", FarmerSchema);
