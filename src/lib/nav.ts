import { url } from './url';

export const NAV_LINKS = [
  { href: url('/events/'), label: 'Events' },
  { href: url('/about/'), label: 'About' },
  { href: url('/team/'), label: 'Team' },
  { href: url('/resources/'), label: 'Resources' },
] as const;
export const JOIN_LINK = { href: url('/join/'), label: 'Join' } as const;
