import { transplantService } from '@/lib/services/transplant.service';
import { clinicalItem } from '@/lib/api/phase3e';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const {GET}=clinicalItem(transplantService);
