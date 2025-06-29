import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsDateString()
  deadline: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
