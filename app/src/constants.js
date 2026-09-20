export const CHAINS = [
  { slug: 'hilton', name: 'Hilton Honors' },
  { slug: 'marriott', name: 'Marriott Bonvoy' },
  { slug: 'hyatt', name: 'World of Hyatt' },
  { slug: 'ihg', name: 'IHG One Rewards' },
  { slug: 'wyndham', name: 'Wyndham Rewards' },
  { slug: 'choice', name: 'Choice Privileges' },
  { slug: 'radisson', name: 'Radisson Rewards' },
  { slug: 'lemontree', name: 'Lemon Tree Infinity Rewards' },
  { slug: 'sarovar', name: 'Sarovar Rewardz' },
  { slug: 'taj', name: 'Taj InnerCircle-NeuPass' },
  { slug: 'itc', name: 'Club ITC' },
  { slug: 'oberoi', name: 'Oberoi One' },
]

export const PROPERTY_TIERS = ['Budget/Midscale', 'Upscale', 'Upper Upscale', 'Luxury']

export const NO_STATUS_TIER = 'No status'

// Number-formatting locale per currency, so INR amounts group as lakhs/crores
// (e.g. ₹12,34,567) rather than the US-style ₹1,234,567.
export const CURRENCY_LOCALES = { USD: 'en-US', INR: 'en-IN' }
export const CURRENCY_SYMBOLS = { USD: '$', INR: '₹' }
