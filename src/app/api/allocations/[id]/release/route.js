import {allocationService} from '@/lib/services/allocation.service';
import {releaseHandler} from '@/lib/api/phase3e';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const POST=releaseHandler(allocationService);
