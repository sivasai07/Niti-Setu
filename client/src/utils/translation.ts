// Translation utility for multilingual support
// This uses a simple translation map for now
// In production, integrate with Google Translate API or similar service

export const translations: Record<string, Record<string, string>> = {
  en: {
    // Page Title
    'check_eligibility': 'Check Your Eligibility',
    
    // Form Labels
    'state': 'State',
    'district': 'District',
    'land_size': 'Land Size (acres)',
    'crop_type': 'Crop Type',
    'category': 'Category',
    'annual_income': 'Annual Income (₹)',
    'income_tax_payer': 'Income Tax Payer',
    'pension': 'Receiving Pension',
    'electricity_connection': 'Electricity Connection',
    
    // Placeholders
    'state_placeholder': 'Select your state',
    'district_placeholder': 'Select your district',
    'land_size_placeholder': 'Enter land size in acres',
    'crop_type_placeholder': 'Enter crop type',
    'income_placeholder': 'Enter annual income',
    
    // Dropdown Options
    'select_category': 'Select Category',
    'select': 'Select',
    'yes': 'Yes',
    'no': 'No',
    
    // Buttons
    'check_eligibility_btn': 'Check Eligibility',
    'use_voice_input': 'Use Voice Input',
    'skip_fill_manually': 'Skip & Fill Form Manually',
    'start_recording': 'Click to start recording',
    'stop_recording': 'Recording... Click to stop',
    'checking_eligibility': 'Checking Eligibility...',
    
    // Messages
    'processing': 'Processing your input...',
    'fill_all_fields': 'Please fill in all required fields',
    'voice_instruction': 'Click the microphone and tell us: your state, district, land size (in acres), crop type, category (General/OBC/SC/ST), annual income, whether you\'re an income tax payer, have pension, and electricity connection.',
    'no_speech_detected': 'No speech detected. Please try again.',
    'speech_error': 'Speech recognition error. Please try again.',
    
    // Results
    'recommendation': 'Recommendation',
    'best_scheme': 'Best scheme for you',
    'eligible': 'Eligible',
    'not_eligible': 'Not Eligible',
    'eligibility_status': 'Eligibility Status',
    'official_documentation': 'Official Documentation',
    'next_steps': 'Next Steps',
    
    // Steps
    'step_1': 'Step 1',
    'step_2': 'Step 2',
  },
  hi: {
    // Page Title
    'check_eligibility': 'अपनी पात्रता जांचें',
    
    // Form Labels
    'state': 'राज्य',
    'district': 'जिला',
    'land_size': 'भूमि का आकार (एकड़)',
    'crop_type': 'फसल का प्रकार',
    'category': 'श्रेणी',
    'annual_income': 'वार्षिक आय (₹)',
    'income_tax_payer': 'आयकर दाता',
    'pension': 'पेंशन प्राप्त करना',
    'electricity_connection': 'बिजली कनेक्शन',
    
    // Buttons
    'check_eligibility_btn': 'पात्रता जांचें',
    'use_voice_input': 'वॉयस इनपुट का उपयोग करें',
    'skip_fill_manually': 'छोड़ें और मैन्युअल रूप से भरें',
    'start_recording': 'रिकॉर्डिंग शुरू करने के लिए क्लिक करें',
    'stop_recording': 'रिकॉर्डिंग... रोकने के लिए क्लिक करें',
    
    // Messages
    'processing': 'आपके इनपुट को प्रोसेस किया जा रहा है...',
    'fill_all_fields': 'कृपया सभी आवश्यक फ़ील्ड भरें',
    'voice_instruction': 'माइक्रोफ़ोन पर क्लिक करें और हमें बताएं: आपका राज्य, जिला, भूमि का आकार (एकड़ में), फसल का प्रकार, श्रेणी (सामान्य/ओबीसी/एससी/एसटी), वार्षिक आय, क्या आप आयकर दाता हैं, पेंशन है, और बिजली कनेक्शन।',
    'no_speech_detected': 'कोई भाषण नहीं मिला। कृपया पुनः प्रयास करें।',
    'speech_error': 'भाषण पहचान त्रुटि। कृपया पुनः प्रयास करें।',
    
    // Results
    'recommendation': 'सिफारिश',
    'best_scheme': 'आपके लिए सबसे अच्छी योजना',
    'eligible': 'पात्र',
    'not_eligible': 'पात्र नहीं',
    'eligibility_status': 'पात्रता स्थिति',
    'official_documentation': 'आधिकारिक दस्तावेज',
    'next_steps': 'अगले कदम',
    
    // Steps
    'step_1': 'चरण 1',
    'step_2': 'चरण 2',
  },
  te: {
    // Page Title
    'check_eligibility': 'మీ అర్హతను తనిఖీ చేయండి',
    
    // Form Labels
    'state': 'రాష్ట్రం',
    'district': 'జిల్లా',
    'land_size': 'భూమి పరిమాణం (ఎకరాలు)',
    'crop_type': 'పంట రకం',
    'category': 'వర్గం',
    'annual_income': 'వార్షిక ఆదాయం (₹)',
    'income_tax_payer': 'ఆదాయపు పన్ను చెల్లింపుదారు',
    'pension': 'పెన్షన్ పొందుతున్నారు',
    'electricity_connection': 'విద్యుత్ కనెక్షన్',
    
    // Placeholders
    'state_placeholder': 'మీ రాష్ట్రాన్ని ఎంచుకోండి',
    'district_placeholder': 'మీ జిల్లాను ఎంచుకోండి',
    'land_size_placeholder': 'ఎకరాలలో భూమి పరిమాణాన్ని నమోదు చేయండి',
    'crop_type_placeholder': 'పంట రకాన్ని నమోదు చేయండి',
    'income_placeholder': 'వార్షిక ఆదాయాన్ని నమోదు చేయండి',
    
    // Dropdown Options
    'select_category': 'వర్గాన్ని ఎంచుకోండి',
    'select': 'ఎంచుకోండి',
    'yes': 'అవును',
    'no': 'కాదు',
    
    // Buttons
    'check_eligibility_btn': 'అర్హత తనిఖీ చేయండి',
    'use_voice_input': 'వాయిస్ ఇన్‌పుట్ ఉపయోగించండి',
    'skip_fill_manually': 'దాటవేసి మాన్యువల్‌గా పూరించండి',
    'start_recording': 'రికార్డింగ్ ప్రారంభించడానికి క్లిక్ చేయండి',
    'stop_recording': 'రికార్డింగ్... ఆపడానికి క్లిక్ చేయండి',
    'checking_eligibility': 'అర్హత తనిఖీ చేస్తోంది...',
    
    // Messages
    'processing': 'మీ ఇన్‌పుట్‌ను ప్రాసెస్ చేస్తోంది...',
    'fill_all_fields': 'దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి',
    'voice_instruction': 'మైక్రోఫోన్‌పై క్లిక్ చేసి మాకు చెప్పండి: మీ రాష్ట్రం, జిల్లా, భూమి పరిమాణం (ఎకరాల్లో), పంట రకం, వర్గం (సాధారణ/ఓబీసీ/ఎస్సీ/ఎస్టీ), వార్షిక ఆదాయం, మీరు ఆదాయపు పన్ను చెల్లింపుదారులా, పెన్షన్ ఉందా, మరియు విద్యుత్ కనెక్షన్.',
    'no_speech_detected': 'ప్రసంగం గుర్తించబడలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
    'speech_error': 'ప్రసంగ గుర్తింపు లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.',
    
    // Results
    'recommendation': 'సిఫార్సు',
    'best_scheme': 'మీకు ఉత్తమ పథకం',
    'eligible': 'అర్హత కలిగినవారు',
    'not_eligible': 'అర్హత లేదు',
    'eligibility_status': 'అర్హత స్థితి',
    'official_documentation': 'అధికారిక డాక్యుమెంటేషన్',
    'next_steps': 'తదుపరి దశలు',
    
    // Steps
    'step_1': 'దశ 1',
    'step_2': 'దశ 2',
  },
  ta: {
    // Page Title
    'check_eligibility': 'உங்கள் தகுதியை சரிபார்க்கவும்',
    
    // Form Labels
    'state': 'மாநிலம்',
    'district': 'மாவட்டம்',
    'land_size': 'நில அளவு (ஏக்கர்)',
    'crop_type': 'பயிர் வகை',
    'category': 'வகை',
    'annual_income': 'ஆண்டு வருமானம் (₹)',
    'income_tax_payer': 'வருமான வரி செலுத்துபவர்',
    'pension': 'ஓய்வூதியம் பெறுதல்',
    'electricity_connection': 'மின்சார இணைப்பு',
    
    // Buttons
    'check_eligibility_btn': 'தகுதியை சரிபார்க்கவும்',
    'use_voice_input': 'குரல் உள்ளீட்டைப் பயன்படுத்தவும்',
    'skip_fill_manually': 'தவிர்த்து கைமுறையாக நிரப்பவும்',
    'start_recording': 'பதிவு தொடங்க கிளிக் செய்யவும்',
    'stop_recording': 'பதிவு செய்கிறது... நிறுத்த கிளிக் செய்யவும்',
    
    // Messages
    'processing': 'உங்கள் உள்ளீட்டை செயலாக்குகிறது...',
    'fill_all_fields': 'தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும்',
    'voice_instruction': 'மைக்ரோஃபோனைக் கிளிக் செய்து எங்களிடம் சொல்லுங்கள்: உங்கள் மாநிலம், மாவட்டம், நில அளவு (ஏக்கரில்), பயிர் வகை, வகை (பொது/ஓபிசி/எஸ்சி/எஸ்டி), ஆண்டு வருமானம், நீங்கள் வருமான வரி செலுத்துபவரா, ஓய்வூதியம் உள்ளதா, மற்றும் மின்சார இணைப்பு.',
    'no_speech_detected': 'பேச்சு கண்டறியப்படவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    'speech_error': 'பேச்சு அங்கீகார பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    
    // Results
    'recommendation': 'பரிந்துரை',
    'best_scheme': 'உங்களுக்கான சிறந்த திட்டம்',
    'eligible': 'தகுதியுடையவர்',
    'not_eligible': 'தகுதியற்றவர்',
    'eligibility_status': 'தகுதி நிலை',
    'official_documentation': 'அதிகாரப்பூர்வ ஆவணங்கள்',
    'next_steps': 'அடுத்த படிகள்',
    
    // Steps
    'step_1': 'படி 1',
    'step_2': 'படி 2',
  },
  kn: {
    // Page Title
    'check_eligibility': 'ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
    
    // Form Labels
    'state': 'ರಾಜ್ಯ',
    'district': 'ಜಿಲ್ಲೆ',
    'land_size': 'ಭೂಮಿ ಗಾತ್ರ (ಎಕರೆಗಳು)',
    'crop_type': 'ಬೆಳೆ ಪ್ರಕಾರ',
    'category': 'ವರ್ಗ',
    'annual_income': 'ವಾರ್ಷಿಕ ಆದಾಯ (₹)',
    'income_tax_payer': 'ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿದಾರ',
    'pension': 'ಪಿಂಚಣಿ ಪಡೆಯುವುದು',
    'electricity_connection': 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ',
    
    // Buttons
    'check_eligibility_btn': 'ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
    'use_voice_input': 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಿ',
    'skip_fill_manually': 'ಬಿಟ್ಟು ಹಸ್ತಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡಿ',
    'start_recording': 'ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    'stop_recording': 'ರೆಕಾರ್ಡಿಂಗ್... ನಿಲ್ಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    
    // Messages
    'processing': 'ನಿಮ್ಮ ಇನ್‌ಪುಟ್ ಅನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
    'fill_all_fields': 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ',
    'voice_instruction': 'ಮೈಕ್ರೊಫೋನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ನಮಗೆ ತಿಳಿಸಿ: ನಿಮ್ಮ ರಾಜ್ಯ, ಜಿಲ್ಲೆ, ಭೂಮಿ ಗಾತ್ರ (ಎಕರೆಗಳಲ್ಲಿ), ಬೆಳೆ ಪ್ರಕಾರ, ವರ್ಗ (ಸಾಮಾನ್ಯ/ಒಬಿಸಿ/ಎಸ್ಸಿ/ಎಸ್ಟಿ), ವಾರ್ಷಿಕ ಆದಾಯ, ನೀವು ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿದಾರರೇ, ಪಿಂಚಣಿ ಇದೆಯೇ, ಮತ್ತು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ.',
    'no_speech_detected': 'ಯಾವುದೇ ಭಾಷಣ ಪತ್ತೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'speech_error': 'ಭಾಷಣ ಗುರುತಿಸುವಿಕೆ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    
    // Results
    'recommendation': 'ಶಿಫಾರಸು',
    'best_scheme': 'ನಿಮಗಾಗಿ ಉತ್ತಮ ಯೋಜನೆ',
    'eligible': 'ಅರ್ಹ',
    'not_eligible': 'ಅರ್ಹವಲ್ಲ',
    'eligibility_status': 'ಅರ್ಹತೆ ಸ್ಥಿತಿ',
    'official_documentation': 'ಅಧಿಕೃತ ದಾಖಲಾತಿ',
    'next_steps': 'ಮುಂದಿನ ಹಂತಗಳು',
    
    // Steps
    'step_1': 'ಹಂತ 1',
    'step_2': 'ಹಂತ 2',
  },
  ml: {
    // Page Title
    'check_eligibility': 'നിങ്ങളുടെ യോഗ്യത പരിശോധിക്കുക',
    
    // Form Labels
    'state': 'സംസ്ഥാനം',
    'district': 'ജില്ല',
    'land_size': 'ഭൂമിയുടെ വലുപ്പം (ഏക്കർ)',
    'crop_type': 'വിള തരം',
    'category': 'വിഭാഗം',
    'annual_income': 'വാർഷിക വരുമാനം (₹)',
    'income_tax_payer': 'ആദായനികുതി അടയ്ക്കുന്നയാൾ',
    'pension': 'പെൻഷൻ സ്വീകരിക്കുന്നു',
    'electricity_connection': 'വൈദ്യുതി കണക്ഷൻ',
    
    // Buttons
    'check_eligibility_btn': 'യോഗ്യത പരിശോധിക്കുക',
    'use_voice_input': 'വോയ്‌സ് ഇൻപുട്ട് ഉപയോഗിക്കുക',
    'skip_fill_manually': 'ഒഴിവാക്കി സ്വമേധയാ പൂരിപ്പിക്കുക',
    'start_recording': 'റെക്കോർഡിംഗ് ആരംഭിക്കാൻ ക്ലിക്ക് ചെയ്യുക',
    'stop_recording': 'റെക്കോർഡിംഗ്... നിർത്താൻ ക്ലിക്ക് ചെയ്യുക',
    
    // Messages
    'processing': 'നിങ്ങളുടെ ഇൻപുട്ട് പ്രോസസ്സ് ചെയ്യുന്നു...',
    'fill_all_fields': 'ദയവായി എല്ലാ ആവശ്യമായ ഫീൽഡുകളും പൂരിപ്പിക്കുക',
    'voice_instruction': 'മൈക്രോഫോണിൽ ക്ലിക്ക് ചെയ്ത് ഞങ്ങളോട് പറയുക: നിങ്ങളുടെ സംസ്ഥാനം, ജില്ല, ഭൂമിയുടെ വലുപ്പം (ഏക്കറിൽ), വിള തരം, വിഭാഗം (പൊതു/ഒബിസി/എസ്സി/എസ്ടി), വാർഷിക വരുമാനം, നിങ്ങൾ ആദായനികുതി അടയ്ക്കുന്നയാളാണോ, പെൻഷൻ ഉണ്ടോ, വൈദ്യുതി കണക്ഷൻ.',
    'no_speech_detected': 'സംസാരം കണ്ടെത്തിയില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    'speech_error': 'സംസാര തിരിച്ചറിയൽ പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    
    // Results
    'recommendation': 'ശുപാർശ',
    'best_scheme': 'നിങ്ങൾക്കുള്ള മികച്ച പദ്ധതി',
    'eligible': 'യോഗ്യത',
    'not_eligible': 'യോഗ്യതയില്ല',
    'eligibility_status': 'യോഗ്യത നില',
    'official_documentation': 'ഔദ്യോഗിക ഡോക്യുമെന്റേഷൻ',
    'next_steps': 'അടുത്ത ഘട്ടങ്ങൾ',
    
    // Steps
    'step_1': 'ഘട്ടം 1',
    'step_2': 'ഘട്ടം 2',
  },
  bn: {
    // Page Title
    'check_eligibility': 'আপনার যোগ্যতা পরীক্ষা করুন',
    
    // Form Labels
    'state': 'রাজ্য',
    'district': 'জেলা',
    'land_size': 'জমির আকার (একর)',
    'crop_type': 'ফসলের ধরন',
    'category': 'শ্রেণী',
    'annual_income': 'বার্ষিক আয় (₹)',
    'income_tax_payer': 'আয়কর প্রদানকারী',
    'pension': 'পেনশন গ্রহণ',
    'electricity_connection': 'বিদ্যুৎ সংযোগ',
    
    // Buttons
    'check_eligibility_btn': 'যোগ্যতা পরীক্ষা করুন',
    'use_voice_input': 'ভয়েস ইনপুট ব্যবহার করুন',
    'skip_fill_manually': 'এড়িয়ে যান এবং ম্যানুয়ালি পূরণ করুন',
    'start_recording': 'রেকর্ডিং শুরু করতে ক্লিক করুন',
    'stop_recording': 'রেকর্ডিং... থামাতে ক্লিক করুন',
    
    // Messages
    'processing': 'আপনার ইনপুট প্রক্রিয়া করা হচ্ছে...',
    'fill_all_fields': 'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন',
    'voice_instruction': 'মাইক্রোফোনে ক্লিক করুন এবং আমাদের বলুন: আপনার রাজ্য, জেলা, জমির আকার (একরে), ফসলের ধরন, শ্রেণী (সাধারণ/ওবিসি/এসসি/এসটি), বার্ষিক আয়, আপনি কি আয়কর প্রদানকারী, পেনশন আছে কি, এবং বিদ্যুৎ সংযোগ।',
    'no_speech_detected': 'কোনো বক্তৃতা সনাক্ত করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    'speech_error': 'বক্তৃতা সনাক্তকরণ ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    
    // Results
    'recommendation': 'সুপারিশ',
    'best_scheme': 'আপনার জন্য সেরা প্রকল্প',
    'eligible': 'যোগ্য',
    'not_eligible': 'যোগ্য নয়',
    'eligibility_status': 'যোগ্যতার অবস্থা',
    'official_documentation': 'সরকারি ডকুমেন্টেশন',
    'next_steps': 'পরবর্তী পদক্ষেপ',
    
    // Steps
    'step_1': 'ধাপ 1',
    'step_2': 'ধাপ 2',
  },
  gu: {
    // Page Title
    'check_eligibility': 'તમારી પાત્રતા તપાસો',
    
    // Form Labels
    'state': 'રાજ્ય',
    'district': 'જિલ્લો',
    'land_size': 'જમીનનું કદ (એકર)',
    'crop_type': 'પાકનો પ્રકાર',
    'category': 'શ્રેણી',
    'annual_income': 'વાર્ષિક આવક (₹)',
    'income_tax_payer': 'આવકવેરા ચૂકવનાર',
    'pension': 'પેન્શન મેળવવું',
    'electricity_connection': 'વીજળી જોડાણ',
    
    // Buttons
    'check_eligibility_btn': 'પાત્રતા તપાસો',
    'use_voice_input': 'વૉઇસ ઇનપુટનો ઉપયોગ કરો',
    'skip_fill_manually': 'છોડો અને મેન્યુઅલી ભરો',
    'start_recording': 'રેકોર્ડિંગ શરૂ કરવા ક્લિક કરો',
    'stop_recording': 'રેકોર્ડિંગ... રોકવા ક્લિક કરો',
    
    // Messages
    'processing': 'તમારા ઇનપુટની પ્રક્રિયા કરી રહ્યા છીએ...',
    'fill_all_fields': 'કૃપા કરીને બધા જરૂરી ક્ષેત્રો ભરો',
    'voice_instruction': 'માઇક્રોફોન પર ક્લિક કરો અને અમને કહો: તમારું રાજ્ય, જિલ્લો, જમીનનું કદ (એકરમાં), પાકનો પ્રકાર, શ્રેણી (સામાન્ય/ઓબીસી/એસસી/એસટી), વાર્ષિક આવક, શું તમે આવકવેરા ચૂકવનાર છો, પેન્શન છે, અને વીજળી જોડાણ.',
    'no_speech_detected': 'કોઈ ભાષણ શોધાયું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    'speech_error': 'ભાષણ ઓળખ ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો.',
    
    // Results
    'recommendation': 'ભલામણ',
    'best_scheme': 'તમારા માટે શ્રેષ્ઠ યોજના',
    'eligible': 'પાત્ર',
    'not_eligible': 'પાત્ર નથી',
    'eligibility_status': 'પાત્રતા સ્થિતિ',
    'official_documentation': 'સત્તાવાર દસ્તાવેજીકરણ',
    'next_steps': 'આગળના પગલાં',
    
    // Steps
    'step_1': 'પગલું 1',
    'step_2': 'પગલું 2',
  },
  mr: {
    // Page Title
    'check_eligibility': 'तुमची पात्रता तपासा',
    
    // Form Labels
    'state': 'राज्य',
    'district': 'जिल्हा',
    'land_size': 'जमिनीचा आकार (एकर)',
    'crop_type': 'पीक प्रकार',
    'category': 'श्रेणी',
    'annual_income': 'वार्षिक उत्पन्न (₹)',
    'income_tax_payer': 'आयकर भरणारा',
    'pension': 'निवृत्तीवेतन मिळवणे',
    'electricity_connection': 'वीज जोडणी',
    
    // Buttons
    'check_eligibility_btn': 'पात्रता तपासा',
    'use_voice_input': 'व्हॉइस इनपुट वापरा',
    'skip_fill_manually': 'वगळा आणि स्वतः भरा',
    'start_recording': 'रेकॉर्डिंग सुरू करण्यासाठी क्लिक करा',
    'stop_recording': 'रेकॉर्डिंग... थांबवण्यासाठी क्लिक करा',
    
    // Messages
    'processing': 'तुमचे इनपुट प्रक्रिया करत आहे...',
    'fill_all_fields': 'कृपया सर्व आवश्यक फील्ड भरा',
    'voice_instruction': 'मायक्रोफोनवर क्लिक करा आणि आम्हाला सांगा: तुमचे राज्य, जिल्हा, जमिनीचा आकार (एकरमध्ये), पीक प्रकार, श्रेणी (सामान्य/ओबीसी/एससी/एसटी), वार्षिक उत्पन्न, तुम्ही आयकर भरणारे आहात का, निवृत्तीवेतन आहे का, आणि वीज जोडणी.',
    'no_speech_detected': 'कोणतेही भाषण आढळले नाही. कृपया पुन्हा प्रयत्न करा.',
    'speech_error': 'भाषण ओळख त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    
    // Results
    'recommendation': 'शिफारस',
    'best_scheme': 'तुमच्यासाठी सर्वोत्तम योजना',
    'eligible': 'पात्र',
    'not_eligible': 'पात्र नाही',
    'eligibility_status': 'पात्रता स्थिती',
    'official_documentation': 'अधिकृत दस्तऐवजीकरण',
    'next_steps': 'पुढील पायऱ्या',
    
    // Steps
    'step_1': 'पायरी 1',
    'step_2': 'पायरी 2',
  },
};

export function translate(key: string, language: string = 'en'): string {
  return translations[language]?.[key] || translations['en'][key] || key;
}

export function getSpeechRecognitionLanguage(languageCode: string): string {
  const languageMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
  };
  return languageMap[languageCode] || 'en-IN';
}

// Text-to-Speech function
export function speakText(text: string, language: string = 'en'): void {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechRecognitionLanguage(language);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser');
  }
}

// Stop any ongoing speech
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Translate text using multiple services for best accuracy
export async function translateText(text: string, fromLang: string, toLang: string = 'en'): Promise<string> {
  if (fromLang === toLang) {
    return text;
  }

  console.log('Attempting translation from', fromLang, 'to', toLang);

  // Try MyMemory API first (often better for Indian languages)
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
    );
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      console.log('MyMemory Translation:', translated);
      
      // Check if translation looks reasonable (not too many repeated words)
      const words = translated.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const repetitionRatio = uniqueWords.size / words.length;
      
      if (repetitionRatio > 0.5) { // At least 50% unique words
        return translated;
      }
      console.warn('MyMemory translation quality low, trying alternatives...');
    }
  } catch (error) {
    console.error('MyMemory error:', error);
  }

  // Try LibreTranslate as backup
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text',
      }),
    });
    
    const data = await response.json();
    
    if (data.translatedText) {
      console.log('LibreTranslate Translation:', data.translatedText);
      return data.translatedText;
    }
  } catch (error) {
    console.error('LibreTranslate error:', error);
  }

  // If all else fails, return original text
  console.warn('All translation services failed, returning original text');
  return text;
}
