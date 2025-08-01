import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty({ description: 'Member email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Member first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Member last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Member phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Member address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Unique membership number' })
  @IsString()
  membershipNumber: string;

  @ApiPropertyOptional({ description: 'Member active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 