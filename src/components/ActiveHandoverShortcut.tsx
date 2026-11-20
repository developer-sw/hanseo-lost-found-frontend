import { useEffect, useState } from 'react'
import { getHandoverId, getHandoverPath } from '../app/handoverRoutes'
import { handoverService } from '../services/handovers'
import { Icon } from './Icon'

export function ActiveHandoverShortcut() {
  const [ids, setIds] = useState<readonly string[]>([])

  useEffect(() => {
    if (!handoverService.connected) return

    let request: AbortController | undefined
    let refreshOnReturn = false
    const lifetime = new AbortController()

    async function loadActive() {
      if (document.hidden || request || lifetime.signal.aborted) return
      request = new AbortController()
      const { signal } = request

      try {
        const result = await handoverService.listActive(signal)
        if (signal.aborted) return
        setIds(result.status === 'ready' ? [...new Set(result.ids)].filter((id) => getHandoverId(getHandoverPath(id)) === id) : [])
      } catch {
        if (!signal.aborted) setIds([])
      } finally {
        request = undefined
        if (refreshOnReturn) {
          refreshOnReturn = false
          void loadActive()
        }
      }
    }

    function refreshVisible() {
      if (document.hidden) return
      if (request) refreshOnReturn = true
      else void loadActive()
    }

    document.addEventListener('visibilitychange', refreshVisible)
    void loadActive()
    return () => {
      lifetime.abort()
      request?.abort()
      document.removeEventListener('visibilitychange', refreshVisible)
    }
  }, [])

  if (!ids.length) return null

  return (
    <a className="primary-link handover-shortcut" href={ids.length === 1 ? getHandoverPath(ids[0]) : '/my?view=account'}>
      <Icon name="map-pin" size={19} /> 전달 진행{ids.length > 1 ? ` ${ids.length}건` : ' 보기'}
    </a>
  )
}
