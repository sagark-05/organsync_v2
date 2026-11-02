import { waitingListService } from '@/lib/services/waiting-list.service';
import { itemHandlers } from '@/lib/api/records';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PATCH, DELETE } = itemHandlers(waitingListService);
