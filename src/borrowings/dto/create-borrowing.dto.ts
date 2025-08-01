import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBorrowingDto {
  @ApiProperty({ description: 'Member ID' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'Edition ID' })
  @IsString()
  editionId: string;

  @ApiPropertyOptional({ description: 'Due date (ISO string)', example: '2025-08-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
} 