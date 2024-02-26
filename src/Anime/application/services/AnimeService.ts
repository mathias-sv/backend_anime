import { IAnimeRepository } from '../../domain/interfaces/IAnimeRepository';
import { Anime } from '../../domain/entities/Anime';
import { Inject, Injectable } from '@nestjs/common';
import { IAnimeService } from './IAnimeService';

@Injectable()
export class AnimeService implements IAnimeService {
  private readonly animeRepository: IAnimeRepository;
  constructor(@Inject('IAnimeRepository') animeRepository: IAnimeRepository) {
    this.animeRepository = animeRepository;
  }

  async getAnime(id: number): Promise<Anime[]> {
    return this.animeRepository.getAnime(id);
  }
  async getFilteredAnime(busqueda: string, filters?: string, order_dir?: string, id?: number, filter_by?: string): Promise<Anime[]> {
    return this.animeRepository.getFilteredAnime(busqueda, filters, order_dir, id, filter_by);
  }
}