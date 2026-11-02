import { compatibilityService } from '@/lib/services/compatibility.service';
import { collectionHandlers } from '@/lib/api/records';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, POST } = collectionHandlers(compatibilityService);
