/**
 * NLPParserService - Extracts structured data from voice transcripts
 * Maps natural language entities to form fields
 */

export interface ParsedFormData {
  state?: string;
  district?: string;
  landSize?: string;
  cropType?: string;
  category?: string;
  annualIncome?: string;
  incomeTaxPayer?: string;
  receivingPension?: string;
  electricityConnection?: string;
}

export class NLPParserService {
  /**
   * Parse transcript and extract form data
   */
  public parseTranscript(transcript: string, language: string = 'en'): ParsedFormData {
    const lowerText = transcript.toLowerCase();
    const formData: ParsedFormData = {};

    // Extract state
    const state = this.extractState(lowerText);
    if (state) formData.state = state;

    // Extract district
    const district = this.extractDistrict(lowerText);
    if (district) formData.district = district;

    // Extract land size
    const landSize = this.extractLandSize(lowerText);
    if (landSize) formData.landSize = landSize;

    // Extract crop type
    const cropType = this.extractCropType(lowerText);
    if (cropType) formData.cropType = cropType;

    // Extract category
    const category = this.extractCategory(lowerText);
    if (category) formData.category = category;

    // Extract annual income
    const annualIncome = this.extractAnnualIncome(lowerText);
    if (annualIncome) formData.annualIncome = annualIncome;

    // Extract income tax payer status
    const incomeTaxPayer = this.extractIncomeTaxPayer(lowerText);
    if (incomeTaxPayer) formData.incomeTaxPayer = incomeTaxPayer;

    // Extract pension status
    const receivingPension = this.extractPensionStatus(lowerText);
    if (receivingPension) formData.receivingPension = receivingPension;

    // Extract electricity connection
    const electricityConnection = this.extractElectricityConnection(lowerText);
    if (electricityConnection) formData.electricityConnection = electricityConnection;

    console.log('Parsed form data:', formData);
    return formData;
  }

  /**
   * Extract state from transcript
   */
  private extractState(text: string): string | null {
    const statePatterns = [
      /(?:state|province)(?:\s+is|\s+of|\s*:|\s+name)?\s+([a-z\s]+?)(?:\s+(?:and|district|,|my|i|the|am|from)|\.|$)/i,
      /(?:from|in)\s+([a-z\s]+?)\s+(?:state|district)/i,
      /([a-z\s]+?)\s+state/i,
    ];

    for (const pattern of statePatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        let state = match[1].trim();
        state = state.replace(/\b(and|my|the|is|of|i|am|from|our)\b/gi, '').trim();
        state = state.replace(/\s+/g, ' ');
        
        if (state.length > 2) {
          return this.capitalizeWords(state);
        }
      }
    }

    return null;
  }

  /**
   * Extract district from transcript
   */
  private extractDistrict(text: string): string | null {
    const districtPatterns = [
      /district(?:\s+is|\s+of|\s*:|\s+name)?\s+([a-z\s]+?)(?:\s+(?:and|,|my|i|the|land|am|from)|\.|$)/i,
      /(?:from|in)\s+([a-z\s]+?)\s+district/i,
      /([a-z\s]+?)\s+district/i,
    ];

    for (const pattern of districtPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        let district = match[1].trim();
        district = district.replace(/\b(and|my|the|is|of|our|i|am|from|state)\b/gi, '').trim();
        district = district.replace(/\s+/g, ' ');
        
        if (district.length > 2) {
          return this.capitalizeWords(district);
        }
      }
    }

    return null;
  }

  /**
   * Extract land size from transcript
   */
  private extractLandSize(text: string): string | null {
    const numberWords: Record<string, string> = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
      'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15',
      'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20',
      'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
      'eighty': '80', 'ninety': '90', 'hundred': '100'
    };

    const landPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:acres?|acre|hectares?|hectare)/i,
      /(?:land|farm|field)(?:\s+(?:is|of|size))?\s*(?:is)?\s*(\d+(?:\.\d+)?)/i,
      /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s*(?:acres?|acre|hectares?|hectare)/i,
      /(?:land|farm|field)(?:\s+(?:is|of|size))?\s*(?:is)?\s*(one|two|three|four|five|six|seven|eight|nine|ten)/i,
    ];

    for (const pattern of landPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let landSize = match[1];
        if (numberWords[landSize.toLowerCase()]) {
          landSize = numberWords[landSize.toLowerCase()];
        }
        return landSize;
      }
    }

    return null;
  }

  /**
   * Extract crop type from transcript
   */
  private extractCropType(text: string): string | null {
    const cropCorrections: Record<string, string> = {
      'maze': 'Maize', 'maiz': 'Maize', 'maize': 'Maize',
      'paddy': 'Rice', 'dhan': 'Rice', 'rice': 'Rice',
      'wheat': 'Wheat', 'cotton': 'Cotton', 'sugarcane': 'Sugarcane',
      'groundnut': 'Groundnut', 'peanut': 'Groundnut',
      'soybean': 'Soybean', 'soya': 'Soybean',
      'chilli': 'Chilli', 'chili': 'Chilli',
      'tomato': 'Tomato', 'potato': 'Potato', 'onion': 'Onion',
      'turmeric': 'Turmeric', 'pulses': 'Pulses', 'dal': 'Pulses',
      'jowar': 'Jowar', 'bajra': 'Bajra', 'ragi': 'Ragi',
    };

    const cropPatterns = [
      /(?:crop|crops|growing|cultivate|cultivating)(?:\s+(?:is|are|type))?\s*(?:is)?\s*([a-z\s,]+?)(?:\s+(?:and|my|i|the|category|land|acre)|\.|$)/i,
      /(?:plant|planting)\s+([a-z\s,]+?)(?:\s+(?:and|my|i|land|acre)|\.|$)/i,
      /(?:type|types)(?:\s+is)?\s+([a-z\s,]+?)(?:\s+(?:and|my|i|the|category)|\.|$)/i,
    ];

    for (const pattern of cropPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        let crop = match[1].trim().toLowerCase();
        crop = crop.replace(/\b(and|my|the|is|of|our|type|types)\b/gi, '').trim();
        crop = crop.replace(/\s+/g, ' ');
        
        if (crop.length < 3) continue;
        
        if (cropCorrections[crop]) {
          return cropCorrections[crop];
        } else {
          return this.capitalizeWords(crop);
        }
      }
    }

    return null;
  }

  /**
   * Extract category from transcript
   */
  private extractCategory(text: string): string | null {
    if (text.match(/\bgeneral\b/i)) {
      return 'General';
    } else if (text.match(/\bobc\b/i) || text.includes('other backward')) {
      return 'OBC';
    } else if (text.match(/\bsc\b/i) || text.includes('scheduled caste')) {
      return 'SC';
    } else if (text.match(/\bst\b/i) || text.includes('scheduled tribe')) {
      return 'ST';
    }

    return null;
  }

  /**
   * Extract annual income from transcript
   */
  private extractAnnualIncome(text: string): string | null {
    const incomePatterns = [
      /(?:income|earning|salary)(?:\s+(?:is|of))?\s*(?:is)?\s*(?:rupees|rs|₹)?\s*(\d+(?:,\d+)*)/i,
      /(\d+(?:,\d+)*)\s*(?:rupees|rs|₹)?\s*(?:income|earning|salary)/i,
      /(?:earn|make)\s*(?:rupees|rs|₹)?\s*(\d+(?:,\d+)*)/i,
    ];

    for (const pattern of incomePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/,/g, '');
      }
    }

    return null;
  }

  /**
   * Extract income tax payer status from transcript
   */
  private extractIncomeTaxPayer(text: string): string | null {
    if (text.match(/(?:not|no|don't|do not).*(?:income tax|tax payer)/i) || 
        text.match(/income tax.*(?:no|not)/i)) {
      return 'No';
    } else if (text.match(/(?:yes|am|is).*(?:income tax|tax payer)/i) || 
               text.match(/(?:pay|paying).*(?:income tax|tax)/i)) {
      return 'Yes';
    }

    return null;
  }

  /**
   * Extract pension status from transcript
   */
  private extractPensionStatus(text: string): string | null {
    if (text.match(/(?:will\s+)?(?:receive|get|have).*pension/i) || 
        text.match(/pension.*(?:yes|have|receive|get)/i)) {
      return 'Yes';
    } else if (text.match(/(?:not|no|don't|do not|will not|won't).*pension/i) || 
               text.match(/pension.*(?:no|not)/i)) {
      return 'No';
    }

    return null;
  }

  /**
   * Extract electricity connection status from transcript
   */
  private extractElectricityConnection(text: string): string | null {
    if (text.match(/(?:not|no|don't|do not).*(?:electricity|electric|power)/i) || 
        text.match(/(?:electricity|electric|power).*(?:no|not)/i)) {
      return 'No';
    } else if (text.match(/(?:yes|have|has).*(?:electricity|electric|power|connection)/i) || 
               text.match(/(?:electricity|electric|power).*(?:yes|have|connection)/i)) {
      return 'Yes';
    }

    return null;
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalizeWords(text: string): string {
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * Validate parsed data
   */
  public validateParsedData(data: ParsedFormData): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields: (keyof ParsedFormData)[] = [
      'state',
      'district',
      'landSize',
      'cropType',
      'category',
      'annualIncome',
      'incomeTaxPayer',
      'receivingPension',
      'electricityConnection',
    ];

    const missingFields = requiredFields.filter(field => !data[field]);

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}

// Export singleton instance
export const nlpParserService = new NLPParserService();
