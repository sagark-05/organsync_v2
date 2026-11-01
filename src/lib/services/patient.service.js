import { patientRepository } from "../repositories/patient.repository.js";
import { createRecordService } from "./record.service.js";
export const patientService = createRecordService("patient", patientRepository);
