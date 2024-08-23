import { Body, Controller, Get, Param, Post, Redirect } from '@nestjs/common';

import { ShortenDto } from './dto/shorten.dto';
import { LinksService } from './links.service';

@Controller()
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Post('/shorten')
  async shorten(@Body() shortenDto: ShortenDto) {
    return this.linksService.shorten(shortenDto);
  }

  @Get('/:code')
  @Redirect(undefined, 301)
  async shortLinkRedirector(@Param('code') code: string) {
    return {
      url: await this.linksService.shortLinkRedirector(code),
    };
  }

  @Get('/stats/:code')
  async getLinkStats(@Param('code') code: string) {
    return this.linksService.getLinkStats(code);
  }
}
