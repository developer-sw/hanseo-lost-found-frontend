const icons = {
  search: <><circle cx="10.75" cy="10.75" r="6.75" /><path d="m16 16 4.5 4.5" /></>,
  sliders: <><path d="M3 6h5m4 0h9M3 12h10m4 0h4M3 18h3m4 0h11" /><circle cx="10" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="8" cy="18" r="2" /></>,
  'arrow-right': <path d="M4 12h15m-6-6 6 6-6 6" />,
  'arrow-left': <path d="M20 12H5m6 6-6-6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  box: <><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" /><path d="m3 8 9 5 9-5m-9 5v8" /></>,
  tag: <><path d="M20 3h-7.5a2 2 0 0 0-1.4.6l-8 8a2 2 0 0 0 0 2.8l6.5 6.5a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 .6-1.4V4a1 1 0 0 0-1-1Z" /><circle cx="16.5" cy="7.5" r="1" /></>,
  'map-pin': <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" /></>,
  'map-pin-house': <><path d="M4 20h16m-15-2 2-5 2 1m6 0 2-1 2 5M18 8c0 3.5-6 8.5-6 8.5S6 11.5 6 8a6 6 0 1 1 12 0Z" /><circle cx="12" cy="8" r="1.7" /></>,
  clipboard: <><path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6m-6 4h6" /><rect x="8" y="3" width="8" height="4" rx="1" /></>,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />,
  users: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2M5.5 5.5a3 3 0 0 0 0 5.7m13-5.7a3 3 0 0 1 0 5.7M2 20v-1.5a5 5 0 0 1 3-4.6m17 6.1v-1.5a5 5 0 0 0-3-4.6" /></>,
  'shield-check': <><path d="M12 3c2.4 1.5 5 2.2 8 2.8v6.3c0 3.6-2.6 6.4-8 9-5.4-2.6-8-5.4-8-9V5.8C7 5.2 9.6 4.5 12 3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  'circle-check': <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 1.8" /></>,
  headphones: <><path d="M7 4a4 4 0 0 1 4 4v2a3 3 0 0 1-2 2.8V20a2 2 0 0 1-4 0v-7.2A3 3 0 0 1 3 10V8a4 4 0 0 1 4-4Zm10 0a4 4 0 0 1 4 4v2a3 3 0 0 1-2 2.8V20a2 2 0 0 1-4 0v-7.2a3 3 0 0 1-2-2.8V8a4 4 0 0 1 4-4ZM6 8h2m8 0h2" /></>,
  wallet: <><path d="M19 8V6a2 2 0 0 0-2.4-2L4.8 6.3A2 2 0 0 0 3 8.2V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2m-18-6V8h16a2 2 0 0 1 2 2v2" /><path d="M21 12h-5a2 2 0 0 0 0 4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z" /><path d="M16 14h.01" /></>,
  backpack: <><path d="M9 5V4a3 3 0 0 1 6 0v1M5 12H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1m14-8h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" /><path d="M5 12a7 7 0 1 1 14 0v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7Z" /><path d="M8 13h8v4H8zM10 8h4" /></>,
  shirt: <path d="m3 7 4-4h2a3 3 0 0 0 6 0h2l4 4-3 4-2-1v11H8V10l-2 1-3-4Z" />,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  home: <><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" /></>,
  'home-filled': <path d="M3.2 10.1a.7.7 0 0 1 .2-.6l8.2-6.3a.7.7 0 0 1 .8 0l8.2 6.3a.7.7 0 0 1 .2.6h-2v9a.9.9 0 0 1-.9.9H14v-6h-4v6H6.1a.9.9 0 0 1-.9-.9v-9h-2Z" fill="currentColor" />,
  edit: <><path d="M13 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7" /><path d="m10 14 .7-3.3L18.5 3a1.4 1.4 0 0 1 2 2l-7.7 7.7-2.8 1.3Z" /></>,
  bookmark: <path d="M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4-6 4V5Z" />,
  user: <><circle cx="12" cy="7" r="3.5" /><path d="M4 20v-1.5a5.5 5.5 0 0 1 5.5-5.5h5a5.5 5.5 0 0 1 5.5 5.5V20H4Z" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 6-2.5 7-2.5 8a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1c0-1-2.5-2-2.5-8Zm-8.1 12a2.3 2.3 0 0 0 4.2 0M12 2V1" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  heart: <path d="M20.7 8.6c0 4.2-5 7.9-8.7 11.4-3.7-3.5-8.7-7.2-8.7-11.4A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8.7 1.2Z" />,
}

export type IconName = keyof typeof icons

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {icons[name]}
    </svg>
  )
}
