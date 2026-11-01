import { donorRepository } from "../repositories/donor.repository.js";
import { createRecordService } from "./record.service.js";
export const donorService = createRecordService("donor", donorRepository);
