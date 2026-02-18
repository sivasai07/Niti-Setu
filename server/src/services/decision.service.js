const { acresToHectares } = require("../utils/unitConverter");

function evaluate(profile, eligibilityText) {
    const hectares = acresToHectares(profile.land_holding_acres);

    if (eligibilityText.includes("less than 2 hectares")) {
        return hectares < 2 ? "Eligible" : "Not Eligible";
    }

    return "Review Required";
}

module.exports = { evaluate };
