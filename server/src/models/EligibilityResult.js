const mongoose = require("mongoose");

const EligibilityResultSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farmer"
    },
    scheme_name: String,
    status: String,
    reasoning: String,
    citation: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EligibilityResult", EligibilityResultSchema);
