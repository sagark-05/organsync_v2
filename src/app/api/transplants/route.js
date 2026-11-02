import { transplantService } from '@/lib/services/transplant.service';
import { clinicalCollection } from '@/lib/api/phase3e';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const {GET,POST}=clinicalCollection(transplantService);
