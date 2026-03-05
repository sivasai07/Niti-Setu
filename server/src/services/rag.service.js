const axios = require("axios");
const { HF_API_KEY, HF_RAG_ENDPOINT } = require("../config/huggingface");

async function queryRAG(profile) {
    const prompt = `
  Farmer Profile:
  State: ${profile.state}
  Land: ${profile.land_holding_acres} acres
  Crop: ${profile.crop_type}

  Check eligibility and return:
  - scheme_name
  - eligibility_condition
  - citation
  `;

    const response = await axios.post(
        HF_RAG_ENDPOINT,
        { inputs: prompt },
        {
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
}

module.exports = { queryRAG };
