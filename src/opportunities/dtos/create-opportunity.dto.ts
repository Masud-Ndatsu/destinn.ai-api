import { IsDateString, IsString, IsUrl } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsDateString()
  deadline: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image_url: string;

  @IsString()
  category_id: string;
}
