import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class ShortenDto {
  @ApiProperty({
    description: 'The URL to be shortened',
    example: 'https://example.com',
  })
  @IsUrl({}, { message: 'The provided value must be a valid URL' })
  url: string;
}
