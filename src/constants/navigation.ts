import { NavigationItem } from '../types/navigation';

/**
 * Main navigation configuration for the marketing site
 */
export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/'
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services'
  },
  {
    id: 'governance',
    label: 'Governance',
    href: '/governance'
  },
  {
    id: 'about',
    label: 'About',
    href: '/about'
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact'
  }
];