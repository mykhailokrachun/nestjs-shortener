import { IsUrl } from 'class-validator';

export class ShortenDto {
  @IsUrl({}, { message: 'The provided value must be a valid URL' })
  url: string;
}
