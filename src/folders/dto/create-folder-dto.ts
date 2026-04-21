import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';



export class CreateFolderDto {



  name!: string;





  image?: string;



  parentId?: string;

}