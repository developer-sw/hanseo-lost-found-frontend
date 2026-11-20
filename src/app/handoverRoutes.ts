import type { HandoverRole } from '../types/handover'

export const HANDOVER_DEMO_PATH = '/handover/demo'

export function getHandoverId(pathname: string): string | undefined {
  const match = /^\/handover\/([^/?#]+)$/.exec(pathname)
  if (!match) return undefined

  try {
    const id = decodeURIComponent(match[1])
    if (id && id.trim() === id && id !== '.' && id !== '..' && id !== 'demo' && !/[\\/]/.test(id)) return id
  } catch {
    return undefined
  }
}

export function getHandoverPath(handoverId: string) {
  return `/handover/${encodeURIComponent(handoverId)}`
}

export function getDemoHandoverPath(handoverId: string, role: HandoverRole) {
  return `${HANDOVER_DEMO_PATH}?${new URLSearchParams({ handoverId, role })}`
}
