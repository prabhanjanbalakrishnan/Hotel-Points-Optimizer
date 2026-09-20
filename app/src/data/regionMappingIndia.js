// Same role as regionMapping.js's DESTINATION_KEYWORDS, but for domestic
// India travel: an Indian traveler's chain-relevance question is usually
// "is this chain strong in Rajasthan vs Kerala," not "strong in Asia" (true
// for every India-based chain regardless of destination, so not a useful
// signal). Zones are a rough simplification for ranking purposes only, not
// an official geographic classification -- e.g. Rajasthan is grouped with
// Gujarat/Maharashtra/Goa here (a common travel-context grouping) rather
// than India's official Northern Zonal Council.
export const INDIA_REGIONS = [
  'North India', 'West India', 'South India', 'East India',
  'Northeast India', 'Central India', 'International',
]

export const INDIA_DESTINATION_KEYWORDS = {
  'North India': [
    'delhi', 'agra', 'lucknow', 'varanasi', 'kanpur', 'noida', 'gurugram', 'gurgaon',
    'chandigarh', 'amritsar', 'jalandhar', 'ludhiana', 'shimla', 'manali', 'dharamshala',
    'rishikesh', 'haridwar', 'dehradun', 'mussoorie', 'srinagar', 'jammu', 'leh', 'ladakh',
    'uttar pradesh', 'uttarakhand', 'punjab', 'haryana', 'himachal', 'kashmir',
  ],
  'West India': [
    'mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'ahmedabad', 'surat', 'vadodara',
    'rajkot', 'jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'pushkar', 'goa', 'panaji',
    'maharashtra', 'gujarat', 'rajasthan',
  ],
  'South India': [
    'bangalore', 'bengaluru', 'mysore', 'mysuru', 'hubli', 'belgaum', 'chennai', 'coimbatore',
    'madurai', 'pondicherry', 'puducherry', 'ooty', 'hyderabad', 'vijayawada', 'visakhapatnam',
    'vizag', 'tirupati', 'warangal', 'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum',
    'kozhikode', 'calicut', 'munnar', 'alleppey', 'kovalam', 'karnataka', 'tamil nadu',
    'kerala', 'andhra pradesh', 'telangana',
  ],
  'East India': [
    'kolkata', 'howrah', 'darjeeling', 'siliguri', 'bhubaneswar', 'puri', 'patna', 'gaya',
    'ranchi', 'jamshedpur', 'west bengal', 'odisha', 'bihar', 'jharkhand',
  ],
  'Northeast India': [
    'guwahati', 'shillong', 'gangtok', 'itanagar', 'imphal', 'aizawl', 'agartala', 'kohima',
    'assam', 'meghalaya', 'sikkim', 'arunachal', 'manipur', 'mizoram', 'nagaland', 'tripura',
  ],
  'Central India': [
    'bhopal', 'indore', 'gwalior', 'jabalpur', 'raipur', 'bilaspur',
    'madhya pradesh', 'chhattisgarh',
  ],
  'International': [
    'dubai', 'abu dhabi', 'uae', 'singapore', 'bangkok', 'phuket', 'bali', 'maldives',
    'male', 'kathmandu', 'nepal', 'colombo', 'sri lanka', 'london', 'paris', 'new york',
    'sydney', 'toronto',
  ],
}
