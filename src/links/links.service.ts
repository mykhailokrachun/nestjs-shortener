import { randomBytes } from 'crypto';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { ShortenDto } from './dto/shorten.dto';
import { Link } from './link.entity';
import { RedisTtl } from './types/redis-ttl.enum';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link) private linksRepository: Repository<Link>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private configService: ConfigService,
  ) {}

  private async incrementClicks(code: string): Promise<void> {
    const link = await this.linksRepository.findOneBy({ code });

    if (!link) {
      return;
    }

    link.clicks += 1;
    await this.linksRepository.save(link);
  }

  async shorten({ url }: ShortenDto) {
    const code = randomBytes(3).toString('hex');

    await this.cacheService.set(code, { url }, RedisTtl.ONE_DAY);

    const link = this.linksRepository.create({
      code,
      url,
      clicks: 0,
    });

    await this.linksRepository.save(link);
    return { url: `${this.configService.get('BASE_URL')}/${code}` };
  }

  async shortLinkRedirector(code: string) {
    const cachedData = await this.cacheService.get<{ url: string }>(code);
    if (cachedData) {
      this.incrementClicks(code);

      return cachedData.url;
    }

    const link = await this.linksRepository.findOneBy({ code });

    if (!link) {
      throw new NotFoundException(`Link with ID ${code} not found`);
    }

    link.clicks += 1;
    await this.linksRepository.save(link);

    await this.cacheService.set(code, { url: link.url }, RedisTtl.ONE_DAY);

    return link.url;
  }

  async getLinkStats(code: string) {
    const link = await this.linksRepository.findOneBy({ code });

    if (!link) {
      throw new NotFoundException(`Link with ID ${code} not found`);
    }

    return { clicks: link.clicks };
  }
}
