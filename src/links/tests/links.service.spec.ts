import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ShortenDto } from '../dto/shorten.dto';
import type { Cache } from 'cache-manager';

import { Link } from '../link.entity';
import { LinksService } from '../links.service';
import { RedisTtl } from '../types/redis-ttl.enum';

describe('LinksService', () => {
  let service: LinksService;
  let repository: Repository<Link>;
  let cache: Cache;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useClass: Repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    repository = module.get<Repository<Link>>(getRepositoryToken(Link));
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  describe('shorten', () => {
    it('should shorten a URL and cache it', async () => {
      const shortenDto: ShortenDto = { url: 'https://example.com' };
      const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 0,
      });
      const createSpy = jest.spyOn(repository, 'create').mockReturnValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 0,
      });
      const setSpy = jest.spyOn(cache, 'set').mockResolvedValue(undefined);

      const result = await service.shorten(shortenDto);

      expect(createSpy).toHaveBeenCalledWith({
        code: expect.any(String) as unknown as string,
        url: 'https://example.com',
        clicks: 0,
      });
      expect(saveSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledWith(
        expect.any(String),
        { url: 'https://example.com' },
        RedisTtl.ONE_DAY,
      );
      expect(result).toEqual({
        url: expect.stringContaining(
          'http://localhost:3000/',
        ) as unknown as string,
      });
    });
  });

  describe('shortLinkRedirector', () => {
    it('should return the URL from cache and increment clicks', async () => {
      const getCacheSpy = jest
        .spyOn(cache, 'get')
        .mockResolvedValue({ url: 'https://example.com' });

      jest.spyOn(repository, 'findOneBy').mockResolvedValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 0,
      });

      jest.spyOn(repository, 'save').mockResolvedValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 1,
      });

      const result = await service.shortLinkRedirector('abc123');

      expect(getCacheSpy).toHaveBeenCalledWith('abc123');
      expect(result).toEqual('https://example.com');
    });

    it('should return the URL from the database if not in cache', async () => {
      const getCacheSpy = jest.spyOn(cache, 'get').mockResolvedValue(undefined);
      const findOneSpy = jest.spyOn(repository, 'findOneBy').mockResolvedValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 0,
      });
      const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 1,
      });
      const setCacheSpy = jest.spyOn(cache, 'set').mockResolvedValue(undefined);

      const result = await service.shortLinkRedirector('abc123');

      expect(getCacheSpy).toHaveBeenCalledWith('abc123');
      expect(findOneSpy).toHaveBeenCalledWith({ code: 'abc123' });
      expect(saveSpy).toHaveBeenCalled();
      expect(setCacheSpy).toHaveBeenCalledWith(
        'abc123',
        { url: 'https://example.com' },
        RedisTtl.ONE_DAY,
      );
      expect(result).toEqual('https://example.com');
    });

    it('should throw NotFoundException if the link is not found', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.shortLinkRedirector('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLinkStats', () => {
    it('should return the link stats', async () => {
      const findOneSpy = jest.spyOn(repository, 'findOneBy').mockResolvedValue({
        _id: 'id123',
        code: 'abc123',
        url: 'https://example.com',
        clicks: 1,
      });

      const result = await service.getLinkStats('abc123');

      expect(findOneSpy).toHaveBeenCalledWith({ code: 'abc123' });
      expect(result).toEqual({ clicks: 1 });
    });

    it('should throw NotFoundException if the link is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.getLinkStats('abc123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
