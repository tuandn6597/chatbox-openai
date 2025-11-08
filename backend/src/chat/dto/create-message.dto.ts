import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

