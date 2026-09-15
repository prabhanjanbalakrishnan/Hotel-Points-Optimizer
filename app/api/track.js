import { Redis } from '@upstash/redis'
import { VALID_CHAIN_IDS } from './_chains.js'

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { chains } = req.body ?? {}
  if (!Array.isArray(chains)) {
    res.status(400).json({ error: '"chains" must be an array of chain ids' })
    return
  }

  const validIds = [...new Set(chains.filter((id) => VALID_CHAIN_IDS.includes(id)))]

  try {
    await Promise.all(validIds.map((id) => redis.incr(`hpo:chain:${id}`)))
    res.status(200).json({ ok: true, incremented: validIds })
  } catch {
    res.status(500).json({ error: 'Failed to record selections' })
  }
}
