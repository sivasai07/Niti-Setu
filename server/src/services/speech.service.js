function extractProfileFromTranscript(transcript) {
    const profile = {
        transcript,
        state: null,
        district: null,
        land_holding_acres: null,
        crop_type: null,
        social_category: null
    };

    const landMatch = transcript.match(/(\d+(\.\d+)?)\s*(acre|acres)/i);
    if (landMatch) {
        profile.land_holding_acres = parseFloat(landMatch[1]);
    }

    if (transcript.toLowerCase().includes("andhra")) {
        profile.state = "Andhra Pradesh";
    }

    if (transcript.toLowerCase().includes("paddy")) {
        profile.crop_type = "Paddy";
    }

    return profile;
}

module.exports = { extractProfileFromTranscript };
