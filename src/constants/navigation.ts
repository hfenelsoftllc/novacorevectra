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

/**
 * Navigation configuration object for content management
 */
export const NAVIGATION_CONFIG = {
  mainNavigation: MAIN_NAVIGATION.filter(item => item.id !== 'home'), // Exclude home from main nav
  allPages: MAIN_NAVIGATION,
  footerNavigation: MAIN_NAVIGATION.filter(item => item.id !== 'home'),
};