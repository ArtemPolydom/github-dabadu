import { Building2, Sparkles, Clock, ConciergeBell } from 'lucide-react';

// Don't use i18next directly here as it may not be initialized
// Instead, we'll use translation keys that will be resolved in components
export const SETUP_MESSAGES = [
  'landing.setup.ready',
  'landing.setup.service',
  'landing.setup.interactions',
  'landing.setup.support',
  'landing.setup.satisfaction',
  'landing.setup.bookings',
  'landing.setup.excellence'
];

export const PARSING_MESSAGES = [
  {
    titleKey: 'landing.loading.booking',
    textKey: 'landing.loading.booking_desc',
    icon: ConciergeBell
  },
  {
    titleKey: 'landing.loading.assistance',
    textKey: 'landing.loading.assistance_desc',
    icon: Clock
  },
  {
    titleKey: 'landing.loading.operations',
    textKey: 'landing.loading.operations_desc',
    icon: Building2
  },
  {
    titleKey: 'landing.loading.revenue',
    textKey: 'landing.loading.revenue_desc',
    icon: Sparkles
  }
];