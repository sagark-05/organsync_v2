import { followUpService } from '@/lib/services/follow-up.service';
import { clinicalCollection } from '@/lib/api/phase3e';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const {GET,POST}=clinicalCollection(followUpService);
