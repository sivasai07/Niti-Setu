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

// Comprehensive scheme details database
const schemeDetails = {
  'PM-KISAN': {
    benefits: [
      'Direct income support of ₹6,000 per year',
      'Payment in three equal installments of ₹2,000 each',
      'Direct Bank Transfer (DBT) to farmer\'s account',
      'No intermediaries - money directly to beneficiaries',
      'Covers all landholding farmer families'
    ],
    required_documents: [
      'Aadhaar Card',
      'Bank Account Details (Account Number, IFSC Code)',
      'Land Ownership Documents (7/12 extract, land records)',
      'Citizenship Certificate',
      'Self-declaration form'
    ],
    application_process: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in)',
      'Click on "Farmers Corner" and select "New Farmer Registration"',
      'Enter Aadhaar number and mobile number',
      'Fill in personal details, bank account information, and land details',
      'Upload required documents',
      'Submit the application and note down the registration number',
      'Track application status using registration number or Aadhaar'
    ],
    important_links: {
      'Official Website': 'https://pmkisan.gov.in/',
      'Beneficiary Status': 'https://pmkisan.gov.in/BeneficiaryStatus.aspx',
      'New Farmer Registration': 'https://pmkisan.gov.in/RegistrationForm.aspx',
      'Aadhaar Linking': 'https://pmkisan.gov.in/UpdateAadhaarNoByFarmer.aspx'
    },
    contact_info: {
      'Helpline Number': '155261 / 011-24300606',
      'Email': 'pmkisan-ict@gov.in',
      'Helpdesk Hours': '9:30 AM to 6:00 PM (Monday to Friday)'
    },
    citation: 'PM-KISAN Operational Guidelines 2019, Section 4.1: "All landholding farmer families shall be eligible for financial benefit of Rs. 6000 per year payable in three equal installments of Rs. 2000 each."',
    document_proof: 'Official PM-KISAN Guidelines Document - Page 4, Paragraph 3'
  },
  'PM-KUSUM': {
    'Component A': {
      benefits: [
        'Financial support for setting up 10,000 MW grid-connected renewable power plants',
        '30% subsidy from Central Government',
        'Additional 30% subsidy from State Government (in most states)',
        'Remaining 40% through bank loans or self-financing',
        'Farmers can sell surplus power to DISCOM',
        'Assured income for 25 years'
      ],
      required_documents: [
        'Land ownership documents',
        'Aadhaar Card',
        'Bank Account Details',
        'Electricity Bill (if applicable)',
        'NOC from electricity department',
        'Project feasibility report',
        'Consent letter from landowner (if land is leased)'
      ],
      application_process: [
        'Visit your State Nodal Agency website or MNRE portal',
        'Download and fill the application form for Component A',
        'Attach all required documents',
        'Submit to the State Nodal Agency',
        'Wait for technical feasibility assessment',
        'Upon approval, sign Power Purchase Agreement (PPA) with DISCOM',
        'Install the solar plant as per specifications',
        'Get inspection and commissioning certificate'
      ]
    },
    'Component B': {
      benefits: [
        'Installation of 20 lakh standalone solar pumps',
        '30% subsidy from Central Government',
        'Additional 30% subsidy from State Government',
        'Remaining 40% through bank loans or self-financing',
        'Eliminates diesel costs',
        'Reliable irrigation even in remote areas',
        'Can sell surplus power to grid (if applicable)'
      ],
      required_documents: [
        'Land ownership documents',
        'Aadhaar Card',
        'Bank Account Details',
        'Farmer registration certificate',
        'Caste certificate (if applicable for additional benefits)',
        'Income certificate',
        'Quotation from empaneled vendors'
      ],
      application_process: [
        'Visit State Agriculture Department or Nodal Agency website',
        'Register as a beneficiary for Component B',
        'Fill application form with land and pump details',
        'Submit documents and select empaneled vendor',
        'Pay your contribution (10-40% depending on category)',
        'Vendor will install the solar pump',
        'Get installation certificate and start using the pump',
        'Receive subsidy amount in your bank account'
      ]
    },
    'Component C': {
      benefits: [
        'Solarization of 15 lakh grid-connected agriculture pumps',
        '30% subsidy from Central Government',
        'Additional 30% subsidy from State Government',
        'Farmers pay only 10-40% depending on category',
        'Reduces electricity bills significantly',
        'Can sell surplus solar power to DISCOM',
        'Additional income of ₹5,000-6,000 per month possible'
      ],
      required_documents: [
        'Electricity connection documents',
        'Aadhaar Card',
        'Bank Account Details',
        'Land ownership documents',
        'Existing pump details and electricity bills',
        'Consent for net metering',
        'Quotation from empaneled vendors'
      ],
      application_process: [
        'Visit DISCOM website or State Nodal Agency portal',
        'Apply for Component C solarization',
        'Provide existing pump and electricity connection details',
        'Submit required documents',
        'Get technical feasibility approval',
        'Select empaneled vendor for solar panel installation',
        'Pay your contribution amount',
        'Installation and net metering setup',
        'Start saving on electricity and earning from surplus power'
      ]
    },
    important_links: {
      'MNRE Official Website': 'https://mnre.gov.in/',
      'PM-KUSUM Portal': 'https://pmkusum.mnre.gov.in/',
      'State Nodal Agencies': 'https://mnre.gov.in/solar/schemes/',
      'Empaneled Vendors List': 'https://pmkusum.mnre.gov.in/vendor.html'
    },
    contact_info: {
      'MNRE Helpline': '011-2436-0707, 011-2436-0404',
      'Email': 'pmkusum-mnre@gov.in',
      'Toll Free Number': '1800-180-3333'
    },
    citation: 'PM-KUSUM Scheme Guidelines 2019, MNRE: "The scheme aims to add solar capacity of 25,750 MW by 2022 with total central financial support of Rs. 34,422 Crore including service charges to implementing agencies."',
    document_proof: 'PM-KUSUM Operational Guidelines - MNRE Document, Section 2: Scheme Components and Financial Support'
  },
  'AIF': {
    benefits: [
      'Financing facility of ₹1 lakh crore for agriculture infrastructure',
      'Interest subvention of 3% per annum',
      'Credit guarantee coverage under CGTMSE',
      'Moratorium period up to 2 years',
      'Repayment period up to 10 years',
      'Support for cold storage, warehouses, processing units, etc.',
      'Available for farmers, FPOs, cooperatives, and agri-entrepreneurs'
    ],
    required_documents: [
      'Project report with cost estimates',
      'Land documents (ownership or lease agreement)',
      'Aadhaar Card and PAN Card',
      'Bank Account Details',
      'Business registration documents (for FPOs/companies)',
      'GST registration (if applicable)',
      'Quotations from suppliers/contractors',
      'Environmental clearances (if required)',
      'Partnership/Shareholding agreements (if applicable)'
    ],
    application_process: [
      'Prepare detailed project report (DPR) with cost estimates',
      'Approach any scheduled commercial bank, RRB, or cooperative bank',
      'Submit loan application with project report and documents',
      'Bank will assess technical and financial viability',
      'Upon approval, loan agreement will be signed',
      'Disbursement will be done in stages based on project progress',
      'Interest subvention will be credited to your account',
      'Complete the project and start operations',
      'Repay loan as per agreed schedule'
    ],
    important_links: {
      'Official Guidelines': 'https://agricoop.nic.in/en/AIF',
      'Scheme Details': 'https://www.nabard.org/content1.aspx?id=648',
      'Application Portal': 'https://www.nabard.org/',
      'List of Eligible Activities': 'https://agricoop.nic.in/sites/default/files/AIF_Guidelines.pdf'
    },
    contact_info: {
      'NABARD Helpline': '022-2653-9895, 022-2653-9896',
      'Email': 'aif@nabard.org',
      'Department of Agriculture': '011-2338-2651'
    },
    citation: 'Agriculture Infrastructure Fund Guidelines 2020, Section 3.2: "Eligible beneficiaries include farmers, FPOs, Pacs, Marketing Cooperative Societies, SHGs, Joint Liability Groups (JLG), Multipurpose Cooperative Societies, Agri-entrepreneurs, Startups, and Central/State agency or Local Body sponsored Public Private Partnership Projects."',
    document_proof: 'AIF Operational Guidelines - Page 7, Section 3: Eligible Beneficiaries and Activities'
  }
};

// Function to add comprehensive details to scheme response
function addSchemeDetails(schemeResponse) {
  const enrichedResponse = { ...schemeResponse };

  // Add details to PM-KISAN
  if (enrichedResponse['PM-KISAN']) {
    enrichedResponse['PM-KISAN'] = {
      ...enrichedResponse['PM-KISAN'],
      ...schemeDetails['PM-KISAN']
    };
  }

  // Add details to PM-KUSUM components
  if (enrichedResponse['PM-KUSUM'] && enrichedResponse['PM-KUSUM'].components) {
    Object.keys(enrichedResponse['PM-KUSUM'].components).forEach(componentKey => {
      const componentName = componentKey.replace(/_/g, ' ');
      if (schemeDetails['PM-KUSUM'][componentName]) {
        enrichedResponse['PM-KUSUM'].components[componentKey] = {
          ...enrichedResponse['PM-KUSUM'].components[componentKey],
          ...schemeDetails['PM-KUSUM'][componentName]
        };
      }
    });
    
    // Add common PM-KUSUM links and contact
    enrichedResponse['PM-KUSUM'].important_links = schemeDetails['PM-KUSUM'].important_links;
    enrichedResponse['PM-KUSUM'].contact_info = schemeDetails['PM-KUSUM'].contact_info;
    enrichedResponse['PM-KUSUM'].citation = schemeDetails['PM-KUSUM'].citation;
    enrichedResponse['PM-KUSUM'].document_proof = schemeDetails['PM-KUSUM'].document_proof;
  }

  // Add details to AIF (handle both "AIF" and "Agriculture Infrastructure Fund (AIF)" keys)
  const aifKey = enrichedResponse['AIF'] ? 'AIF' : 'Agriculture Infrastructure Fund (AIF)';
  if (enrichedResponse[aifKey]) {
    enrichedResponse[aifKey] = {
      ...enrichedResponse[aifKey],
      ...schemeDetails['AIF']
    };
    
    // Also create a shorthand reference if the full name is used
    if (aifKey === 'Agriculture Infrastructure Fund (AIF)' && !enrichedResponse['AIF']) {
      enrichedResponse['AIF'] = enrichedResponse[aifKey];
    }
  }

  return enrichedResponse;
}

// Eligibility checking function
export const checkEligibility = async (req, res) => {
  try {
    const { 
      state, 
      district, 
      landSize,
      cropType, 
      category,
      annualIncome,
      incomeTaxPayer,
      receivingPension,
      electricityConnection
    } = req.body;

    console.log('Received eligibility check request:', req.body);

    // Call HuggingFace Space API
    const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://sivasai07-niti-setu-eligibility.hf.space';
    
    const response = await fetch(`${HF_SPACE_URL}/check-eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state,
        district,
        land_size: landSize,
        crop_type: cropType,
        category,
        annual_income: annualIncome,
        income_tax_payer: incomeTaxPayer,
        pension: receivingPension,
        electricity_connection: electricityConnection
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    console.log('HuggingFace API response:', JSON.stringify(apiResponse, null, 2));

    // Extract the data from the response
    const eligibilityData = apiResponse.data || apiResponse;
    console.log('Extracted eligibility data:', JSON.stringify(eligibilityData, null, 2));

    // Add comprehensive scheme details to the response
    const enrichedData = addSchemeDetails(eligibilityData);
    console.log('Enriched response:', JSON.stringify(enrichedData, null, 2));

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
