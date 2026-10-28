'use client';

import React from 'react';

export type IconName =
  | 'shield'
  | 'compass'
  | 'book'
  | 'sparkles'
  | 'chat'
  | 'chart'
  | 'users'
  | 'graduation'
  | 'calendar'
  | 'clock'
  | 'search'
  | 'bell'
  | 'menu'
  | 'close'
  | 'logout'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'check'
  | 'check-circle'
  | 'alert'
  | 'lock'
  | 'play'
  | 'send'
  | 'copy'
  | 'refresh'
  | 'trash'
  | 'plus'
  | 'trophy'
  | 'flame'
  | 'target'
  | 'settings'
  | 'link'
  | 'mail'
  | 'eye'
  | 'eye-off'
  | 'chevron-down'
  | 'chevron-right'
  | 'bolt'
  | 'brain'
  | 'layers'
  | 'download'
  | 'star'
  | 'file'
  | 'activity'
  | 'globe'
  | 'cpu'
  | 'database'
  | 'pencil'
  | 'home'
  | 'life-buoy'
  | 'info'
  | 'external-link'
  | 'award'
  | 'filter'
  | 'grid'
  | 'list'
  | 'whatsapp'
  | 'trending-up'
  | 'user-check'
  | 'clipboard'
  | 'bookmark'
  | 'sun';

const PATHS: Record<IconName, React.ReactNode> = {
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.8 3 8.3 7 9.5 4-1.2 7-4.7 7-9.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 7h8M8 11h5" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      <path d="m5 14 .7 1.9L7.5 16.6l-1.8.7L5 19l-.7-1.7-1.8-.7 1.8-.7L5 14Z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.9-5.2a8.2 8.2 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" />
      <path d="M8.5 10.5h7M8.5 13.8h4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9M18 14.4a6.2 6.2 0 0 1 3.2 5.6" />
    </>
  ),
  graduation: (
    <>
      <path d="m2 9 10-4 10 4-10 4L2 9Z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      <path d="M22 9v5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  logout: (
    <>
      <path d="M15 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2.5" />
      <path d="M10 12h11M18 9l3 3-3 3" />
    </>
  ),
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  'arrow-left': <path d="M20 12H5M11 6l-6 6 6 6" />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m4 12 5 5L20 6" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16 9" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4.5M12 17h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  send: (
    <>
      <path d="m21 3-9.5 18-2.2-7.3L2 11.5 21 3Z" />
      <path d="M21 3 9.3 13.7" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2.5" />
      <path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3H5.5A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 5v5h-5" />
      <path d="M20 10a8 8 0 1 0-2.3 7" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 13v4M8 21h8M9.5 17h5v4" />
    </>
  ),
  flame: (
    <path d="M12 22c4 0 7-2.7 7-6.6 0-3.9-2.4-6.1-4.4-8.4C13.3 5.5 12 3.5 12 2c0 0-1.2 3-3 4.5C6.8 8.4 5 10.2 5 15.4 5 19.3 8 22 12 22Z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 0 0-6.4-6.4L11.4 5.7" />
      <path d="M14 10.5a4.5 4.5 0 0 0-6.4 0L5 13.1a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.4 3.2M6.7 6.7A17 17 0 0 0 2.5 12S6 18 12 18a9.8 9.8 0 0 0 4.2-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  brain: (
    <>
      <path d="M9.5 3a3 3 0 0 0-3 3 3.2 3.2 0 0 0-2 5.9A3.3 3.3 0 0 0 6 18a3 3 0 0 0 3.5 3V3Z" />
      <path d="M14.5 3a3 3 0 0 1 3 3 3.2 3.2 0 0 1 2 5.9A3.3 3.3 0 0 1 18 18a3 3 0 0 1-3.5 3V3Z" />
      <path d="M9.5 8H8M9.5 13H8M14.5 8H16M14.5 13H16" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9L12 3Z" />
  ),
  file: (
    <>
      <path d="M13 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V10l-7-7Z" />
      <path d="M13 3v7h7M8 14h8M8 17.5h5" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-7 4 14 2.5-7h5" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  pencil: (
    <>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-5 1 1-5L16.5 3.5Z" />
      <path d="m14 6 4 4" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.5 12 3l8 7.5" />
      <path d="M6 9.5V21h12V9.5" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  'life-buoy': (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  'external-link': (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 4 18.5v-9A2.5 2.5 0 0 1 6.5 7H11" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="m8.5 13.5-1 7.5 4.5-2.5 4.5 2.5-1-7.5" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  whatsapp: (
    <>
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.5-4.7a8.5 8.5 0 1 1 16-4.2Z" />
      <path d="M8.8 8.2c.4-.8 1-.7 1.3 0 .3.7.7 1.5.4 1.9-.3.4-.8.7-.4 1.3.6.9 1.4 1.6 2.4 2 .6.3.8-.2 1.2-.5.4-.3 1.2.1 1.8.4.7.4.7 1-.1 1.4-1.5.8-3.5.1-5-1.3-1.5-1.4-2.3-3.5-1.6-5.2Z" />
    </>
  ),
  'trending-up': (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  'user-check': (
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M2.5 20a7 7 0 0 1 12.4-4.5" />
      <path d="m16.5 18 1.8 1.8 3.7-3.8" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4V2.8h6V4M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-4.5L6 21V3Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9 6.3 6.3M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7 4.9 19.1" />
    </>
  ),
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  filled = false,
  className = '',
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...rest}
  >
    {PATHS[name]}
  </svg>
);

export default Icon;
