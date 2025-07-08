import { IsOptional, IsString } from 'class-validator';

export class AddCrawlTargetDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  platform: string;
}
