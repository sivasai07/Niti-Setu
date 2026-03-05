/**
 * EligibilityService - Handles eligibility API calls with translation
 * Translates form data to English before API call using Groq
 * Translates response back to user's language using Groq
 */

export interface EligibilityFormData {
  state: string;
  district: string;
  landSize: number;
  cropType: string;
  category: string;
  annualIncome: number;
  incomeTaxPayer: boolean;
  receivingPension: boolean;
  electricityConnection: boolean;
}

export interface EligibilityResponse {
  [key: string]: any;
}

export class EligibilityService {
  private apiEndpoint: string = 'https://sivasai07-niti-setu-eligibility.hf.space/check-eligibility';
  private groqApiEndpoint: string = 'http://localhost:5000/api/groq';

  /**
   * Check eligibility with automatic translation using Groq
   */
  public async checkEligibility(
    formData: EligibilityFormData,
    userLanguage: string
  ): Promise<EligibilityResponse> {
    try {
      // Translate form data to English if needed
      const englishFormData = await this.translateFormDataToEnglish(formData, userLanguage);

      // Make API call with English data
      const response = await this.callEligibilityAPI(englishFormData);

      // Translate response back to user language if needed
      const translatedResponse = await this.translateResponseToUserLanguage(
        response,
        userLanguage
      );

      return translatedResponse;
    } catch (error: any) {
      console.error('Eligibility check error:', error);
      throw new Error(error.message || 'Failed to check eligibility');
    }
  }

  /**
   * Translate form data to English using Groq API
   */
  private async translateFormDataToEnglish(
    formData: EligibilityFormData,
    fromLanguage: string
  ): Promise<EligibilityFormData> {
    if (fromLanguage === 'en') {
      return formData;
    }

    const translated = { ...formData };

    try {
      // Translate state
      const stateResponse = await fetch(`${this.groqApiEndpoint}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.state,
          fromLang: fromLanguage,
          toLang: 'en',
        }),
      });
      if (stateResponse.ok) {
        const stateData = await stateResponse.json();
        translated.state = stateData.data.translatedText;
      }

      // Translate district
      const districtResponse = await fetch(`${this.groqApiEndpoint}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.district,
          fromLang: fromLanguage,
          toLang: 'en',
        }),
      });
      if (districtResponse.ok) {
        const districtData = await districtResponse.json();
        translated.district = districtData.data.translatedText;
      }

      // Translate crop type
      const cropResponse = await fetch(`${this.groqApiEndpoint}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.cropType,
          fromLang: fromLanguage,
          toLang: 'en',
        }),
      });
      if (cropResponse.ok) {
        const cropData = await cropResponse.json();
        translated.cropType = cropData.data.translatedText;
      }

      console.log('Translated form data to English using Groq:', translated);
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to original data if translation fails
    }

    return translated;
  }

  /**
   * Call eligibility API with English data
   */
  private async callEligibilityAPI(formData: EligibilityFormData): Promise<EligibilityResponse> {
    const requestBody = {
      land_size: formData.landSize,
      income_tax_payer: formData.incomeTaxPayer ? 1 : 0,
      pension: formData.receivingPension ? 1 : 0,
      annual_income: formData.annualIncome,
      electricity_connection: formData.electricityConnection ? 1 : 0,
      category: formData.category,
      state: formData.state,
      district: formData.district,
      crop_type: formData.cropType,
    };

    console.log('Calling API with:', requestBody);

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  /**
   * Translate response back to user language
   */
  private async translateResponseToUserLanguage(
    response: EligibilityResponse,
    toLanguage: string
  ): Promise<EligibilityResponse> {
    if (toLanguage === 'en') {
      return response;
    }

    // For now, return as is - translation of complex nested objects
    // can be added based on specific response structure
    console.log('Response translation to', toLanguage, 'not yet implemented');
    return response;
  }

  /**
   * Retry logic for API calls
   */
  public async checkEligibilityWithRetry(
    formData: EligibilityFormData,
    userLanguage: string,
    maxRetries: number = 3
  ): Promise<EligibilityResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.checkEligibility(formData, userLanguage);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed after multiple retries');
  }
}

// Export singleton instance
export const eligibilityService = new EligibilityService();
