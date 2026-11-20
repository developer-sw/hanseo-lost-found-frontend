import type { HandoverLocationFailure, HandoverLocationResult } from '../types/handover'

const geoFailures: Readonly<Partial<Record<number, HandoverLocationFailure['status']>>> = {
  1: 'permission-denied',
  2: 'position-unavailable',
  3: 'timeout',
}

export function requestHandoverLocation(signal?: AbortSignal): Promise<HandoverLocationResult> {
  if (signal?.aborted) return Promise.resolve({ status: 'aborted' })
  if (typeof window === 'undefined') return Promise.resolve({ status: 'unsupported' })
  if (!window.isSecureContext) return Promise.resolve({ status: 'insecure-context' })
  if (!navigator.geolocation) return Promise.resolve({ status: 'unsupported' })

  return new Promise((resolve) => {
    let settled = false

    function finish(result: HandoverLocationResult) {
      if (settled) return
      settled = true
      signal?.removeEventListener('abort', abort)
      resolve(result)
    }

    function abort() {
      finish({ status: 'aborted' })
    }

    signal?.addEventListener('abort', abort, { once: true })
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => finish({ status: 'ready', input: { type: 'gps', latitude: coords.latitude, longitude: coords.longitude } }),
        ({ code }) => finish({ status: geoFailures[code] ?? 'position-unavailable' }),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      )
    } catch {
      finish({ status: 'position-unavailable' })
    }
  })
}
