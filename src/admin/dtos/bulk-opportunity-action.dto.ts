import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export enum BulkOpportunityAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  DELETE = 'delete',
}

export class BulkOpportunityActionDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @IsEnum(BulkOpportunityAction)
  action: BulkOpportunityAction;
}