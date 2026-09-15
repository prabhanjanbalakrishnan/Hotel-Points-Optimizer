import { Redis } from '@upstash/redis'
import { VALID_CHAIN_IDS } from './_chains.js'

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const keys = VALID_CHAIN_IDS.map((id) => `hpo:chain:${id}`)
    const counts = await redis.mget(...keys)
    const result = Object.fromEntries(
      VALID_CHAIN_IDS.map((id, i) => [id, Number(counts[i]) || 0]),
    )
    res.setHeader('Cache-Control', 's-maxage=30')
    res.status(200).json(result)
  } catch {
    res.status(500).json({ error: 'Failed to load stats' })
  }
}
