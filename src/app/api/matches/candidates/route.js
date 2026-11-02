import { matchingService } from '@/lib/services/matching.service';
import { collectionHandlers } from '@/lib/api/records';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET } = collectionHandlers({ list: query => matchingService.candidates(query) });
