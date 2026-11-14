export const NAV_LEFT = [
  { href: '/about', label: 'About' },
  { href: '/treatments', label: 'Treatments' },
  { href: '/fertility', label: 'Fertility' },
] as const;

export const NAV_RIGHT = [
  { href: '/pregnancy', label: 'Pregnancy' },
  { href: '/team', label: 'Team' },
  { href: '/contact', label: 'Contact' },
] as const;

export const NAV_ALL = [...NAV_LEFT, ...NAV_RIGHT, { href: '/urgent', label: 'Urgent help' }] as const;
