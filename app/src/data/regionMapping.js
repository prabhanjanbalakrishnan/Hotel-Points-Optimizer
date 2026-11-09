export const REGIONS = [
  'North America', 'Europe', 'Asia', 'Middle East', 'Africa', 'South America', 'Oceania',
]

// Lowercase keyword -> region. Matched as whole words/phrases against the user's free-text
// destination, longest keyword wins (see bestKeywordMatch in pointsLogic.js).
export const DESTINATION_KEYWORDS = {
  'North America': [
    'usa', 'united states', 'america', 'canada', 'mexico', 'new york', 'los angeles',
    'chicago', 'toronto', 'vancouver', 'hawaii', 'california', 'texas', 'miami', 'boston',
    'washington', 'philadelphia', 'orlando', 'florida', 'nashville', 'new orleans', 'austin',
    'denver', 'colorado', 'las vegas', 'nevada', 'san francisco', 'san diego', 'seattle',
    'honolulu', 'atlanta', 'dallas', 'houston', 'phoenix', 'arizona', 'utah', 'montana',
    'alaska', 'cancun', 'punta cana', 'dominican republic', 'puerto rico', 'jamaica',
    'bahamas', 'aruba', 'caribbean',
  ],
  'Europe': [
    'france', 'paris', 'italy', 'rome', 'milan', 'spain', 'madrid', 'barcelona', 'uk',
    'london', 'england', 'germany', 'berlin', 'greece', 'portugal', 'lisbon', 'amsterdam',
    'switzerland', 'vienna', 'prague',
  ],
  'Asia': [
    'japan', 'tokyo', 'kyoto', 'china', 'beijing', 'shanghai', 'thailand', 'bangkok',
    'singapore', 'korea', 'seoul', 'vietnam', 'hanoi', 'india', 'bali', 'indonesia',
    'hong kong', 'taiwan', 'taipei', 'maldives', 'phuket', 'malaysia', 'kuala lumpur',
    'philippines', 'manila', 'sri lanka', 'nepal',
  ],
  'Middle East': [
    'dubai', 'uae', 'abu dhabi', 'qatar', 'doha', 'saudi arabia', 'riyadh', 'israel',
    'tel aviv', 'istanbul', 'turkey', 'jordan', 'oman',
  ],
  'Africa': [
    'south africa', 'kenya', 'nairobi', 'morocco', 'marrakesh', 'egypt', 'cairo',
    'cape town', 'tanzania', 'zanzibar', 'ethiopia',
  ],
  'South America': [
    'south america', 'brazil', 'rio', 'sao paulo', 'argentina', 'buenos aires', 'chile', 'santiago',
    'peru', 'lima', 'cusco', 'colombia', 'bogota', 'ecuador',
  ],
  'Oceania': [
    'australia', 'sydney', 'melbourne', 'new zealand', 'auckland', 'fiji', 'brisbane',
  ],
}
