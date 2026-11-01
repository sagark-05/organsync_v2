import { donorService } from '@/lib/services/donor.service';
import { itemHandlers } from '@/lib/api/records';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PATCH, DELETE } = itemHandlers(donorService);
