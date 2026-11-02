import { compatibilityService } from '@/lib/services/compatibility.service';
import { itemHandlers } from '@/lib/api/records';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET } = itemHandlers(compatibilityService);
