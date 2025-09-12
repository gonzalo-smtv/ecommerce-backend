import { IsString, IsNumber, IsBoolean, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookNotificationDto {
  @ApiProperty({ description: 'The ID of the notification' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Whether the notification is from live mode or test mode' })
  @IsBoolean()
  live_mode: boolean;

  @ApiProperty({ description: 'The type of notification (e.g., payment, subscription, etc.)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'When the notification was created' })
  @IsDateString()
  date_created: string;

  @ApiProperty({ description: 'The application ID' })
  @IsNumber()
  application_id: number;

  @ApiProperty({ description: 'The user ID' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'The version of the API' })
  @IsString()
  api_version: string;

  @ApiProperty({ description: 'The action that triggered the notification' })
  @IsString()
  action: string;

  @ApiProperty({ description: 'The data object containing the resource ID' })
  @IsObject()
  data: {
    id: string | number;
  };
} 