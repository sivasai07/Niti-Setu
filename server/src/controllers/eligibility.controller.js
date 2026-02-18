// import History from '../models/History.js';

// // Sample schemes data (in production, this would come from a database)
// const schemes = [
//   {
//     name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
//     description: 'Financial support of ₹6000 per year to small and marginal farmers',
//     category: 'Agriculture',
//     benefit: '₹6000/year',
//     eligibility: {
//       occupation: ['farmer', 'agriculture'],
//       landSize: { max: 2 },
//       income: { max: 200000 },
//     },
//   },
//   {
//     name: 'PM Fasal Bima Yojana',
//     description: 'Crop insurance scheme providing financial support to farmers in case of crop failure',
//     category: 'Insurance',
//     benefit: 'Crop Insurance',
//     eligibility: {
//       occupation: ['farmer', 'agriculture'],
//     },
//   },
//   {
//     name: 'Kisan Credit Card (KCC)',
//     description: 'Credit facility for farmers to meet agricultural expenses',
//     category: 'Credit',
//     benefit: 'Credit up to ₹3 lakhs',
//     eligibility: {
//       occupation: ['farmer', 'agriculture'],
//     },
//   },
//   {
//     name: 'PM Kisan Maandhan Yojana',
//     description: 'Pension scheme for small and marginal farmers',
//     category: 'Pension',
//     benefit: '₹3000/month pension',
//     eligibility: {
//       occupation: ['farmer', 'agriculture'],
//       age: { min: 18, max: 40 },
//       landSize: { max: 2 },
//     },
//   },
//   {
//     name: 'National Food Security Mission',
//     description: 'Support for increasing production of rice, wheat, pulses, and coarse cereals',
//     category: 'Agriculture',
//     benefit: 'Seeds & Training',
//     eligibility: {
//       occupation: ['farmer', 'agriculture'],
//     },
//   },
// ];

// // @desc    Process voice input and extract information
// // @route   POST /api/eligibility/process-voice
// // @access  Private
// export const processVoiceInput = async (req, res) => {
//   try {
//     const { transcript } = req.body;

//     if (!transcript) {
//       return res.status(400).json({
//         success: false,
//         message: 'Transcript is required',
//       });
//     }

//     // Simple keyword extraction (in production, use NLP/AI)
//     const extractedData = {};
//     const lowerTranscript = transcript.toLowerCase();

//     // Extract state (common Indian states)
//     const states = ['andhra pradesh', 'telangana', 'tamil nadu', 'karnataka', 'kerala', 'maharashtra', 'gujarat', 'rajasthan', 'punjab', 'haryana', 'uttar pradesh', 'bihar', 'west bengal', 'odisha', 'madhya pradesh'];
//     for (const state of states) {
//       if (lowerTranscript.includes(state)) {
//         extractedData.state = state.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//         break;
//       }
//     }

//     // Extract district (you can expand this list)
//     const districtMatch = lowerTranscript.match(/district\s+(\w+)|(\w+)\s+district/i);
//     if (districtMatch) {
//       extractedData.district = (districtMatch[1] || districtMatch[2]).charAt(0).toUpperCase() + (districtMatch[1] || districtMatch[2]).slice(1);
//     }

//     // Extract land holding
//     const landMatch = lowerTranscript.match(/(\d+\.?\d*)\s*(acre|acres|hectare|hectares)/i);
//     if (landMatch) {
//       extractedData.landHolding = landMatch[1];
//     }

//     // Extract crop type
//     const crops = ['rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'pulses', 'groundnut', 'soybean', 'millets'];
//     for (const crop of crops) {
//       if (lowerTranscript.includes(crop)) {
//         extractedData.cropType = crop.charAt(0).toUpperCase() + crop.slice(1);
//         break;
//       }
//     }

//     // Extract social category
//     if (lowerTranscript.includes('sc ') || lowerTranscript.includes('scheduled caste')) {
//       extractedData.socialCategory = 'SC';
//     } else if (lowerTranscript.includes('st ') || lowerTranscript.includes('scheduled tribe')) {
//       extractedData.socialCategory = 'ST';
//     } else if (lowerTranscript.includes('obc') || lowerTranscript.includes('other backward')) {
//       extractedData.socialCategory = 'OBC';
//     } else if (lowerTranscript.includes('general')) {
//       extractedData.socialCategory = 'General';
//     }

//     res.status(200).json({
//       success: true,
//       extractedData,
//     });
//   } catch (error) {
//     console.error('Process voice error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// };

// // @desc    Check eligibility for schemes
// // @route   POST /api/eligibility/check
// // @access  Private
// export const checkEligibility = async (req, res) => {
//   try {
//     const { state, district, landHolding, cropType, socialCategory } = req.body;

//     // Filter schemes based on eligibility criteria
//     const eligibleSchemes = schemes.filter(scheme => {
//       const { eligibility } = scheme;

//       // Check land holding
//       if (eligibility.landSize) {
//         const userLandSize = parseFloat(landHolding);
//         if (eligibility.landSize.max && userLandSize > eligibility.landSize.max) return false;
//       }

//       // Check crop type (if scheme is crop-specific)
//       if (eligibility.cropType) {
//         const cropMatch = eligibility.cropType.some(crop => 
//           cropType?.toLowerCase().includes(crop.toLowerCase())
//         );
//         if (!cropMatch) return false;
//       }

//       // All farmers are eligible for general schemes
//       return true;
//     });

//     // Get scheme names for description
//     const schemeNames = eligibleSchemes.map(s => s.name).slice(0, 2).join(', ');
//     const moreSchemes = eligibleSchemes.length > 2 ? ` and ${eligibleSchemes.length - 2} more` : '';

//     // Add to history with input and output data
//     await History.create({
//       user: req.user.id,
//       type: 'scheme',
//       title: 'Checked Eligibility',
//       description: `Found ${eligibleSchemes.length} eligible schemes${eligibleSchemes.length > 0 ? `: ${schemeNames}${moreSchemes}` : ''} for ${cropType || 'farming'} (${landHolding} acres) in ${district}, ${state}`,
//       status: 'completed',
//       inputData: {
//         state,
//         district,
//         landHolding,
//         cropType,
//         socialCategory,
//       },
//       outputData: {
//         schemes: eligibleSchemes,
//         totalSchemes: eligibleSchemes.length,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       schemes: eligibleSchemes,
//     });
//   } catch (error) {
//     console.error('Check eligibility error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// };
// Placeholder function for voice input processing
export const processVoiceInput = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: 'Transcript is required',
      });
    }

    // TODO: Implement voice processing logic
    res.status(200).json({
      success: true,
      message: 'Voice processing not yet implemented',
      extractedData: {},
    });
  } catch (error) {
    console.error('Process voice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Placeholder function for eligibility checking
export const checkEligibility = async (req, res) => {
  try {
    const { state, district, landHolding, cropType, socialCategory } = req.body;

    // TODO: Implement eligibility checking logic
    // This would integrate with RAG service and decision service when ready
    
    res.status(200).json({
      success: true,
      message: 'Eligibility checking not yet fully implemented',
      schemes: [],
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
