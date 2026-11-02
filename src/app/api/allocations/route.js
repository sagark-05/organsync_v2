import { allocationService } from '@/lib/services/allocation.service';
import { clinicalCollection } from '@/lib/api/phase3e';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const {GET,POST}=clinicalCollection(allocationService);
