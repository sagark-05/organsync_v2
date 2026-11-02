import { followUpService } from '@/lib/services/follow-up.service';
import { clinicalItem } from '@/lib/api/phase3e';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const {GET}=clinicalItem(followUpService);
