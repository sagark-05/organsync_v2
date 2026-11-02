import { matchingService } from '@/lib/services/matching.service';
import { itemHandlers } from '@/lib/api/records';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PATCH } = itemHandlers(matchingService);
