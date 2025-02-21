import { subscriptionFormSchema } from '@/db/validation';
import { createSafeActionClient } from 'next-safe-action';

export const actionClient = createSafeActionClient();
