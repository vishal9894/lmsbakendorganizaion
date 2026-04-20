import { AccessType } from "../entities/create-event.entity";

export class CreateEventDto {
  name!: string;
  courseId!: string;
  courseName!: string;
  folderId!: string;
  url!: string;
  description!: string;
  status!: boolean;
  accessType!: AccessType;
}