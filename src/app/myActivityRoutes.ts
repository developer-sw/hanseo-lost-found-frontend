export type MyActivityTab = 'lost' | 'found' | 'claims'

export function getMyActivityTab(params: URLSearchParams): MyActivityTab {
  const tab = params.get('tab')
  return tab === 'found' || tab === 'claims' ? tab : 'lost'
}

export function getMyActivityPath(tab: MyActivityTab, options: { empty?: boolean; edit?: string; account?: boolean } = {}) {
  const params = new URLSearchParams({ tab })
  if (options.empty) params.set('demo', 'empty')
  if (options.edit) params.set('edit', options.edit)
  if (options.account) params.set('view', 'account')
  return `/my?${params}`
}
