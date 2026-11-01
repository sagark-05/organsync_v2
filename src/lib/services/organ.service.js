import { organRepository } from "../repositories/organ.repository.js";
import { createRecordService } from "./record.service.js";
export const organService = createRecordService("organ", organRepository);
