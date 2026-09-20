// Kept in sync by hand with src/constants.js's CHAINS list — the client bundle
// and this serverless bundle are built separately, so importing across them
// isn't worth the tooling complexity for a fixed-size list. Update both if a
// chain is ever added or removed.
export const VALID_CHAIN_IDS = [
  'hilton', 'marriott', 'hyatt', 'ihg', 'wyndham', 'choice',
  'radisson', 'lemontree', 'sarovar', 'taj', 'itc', 'oberoi',
]
