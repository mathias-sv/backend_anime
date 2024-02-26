import { Anime } from '../entities/Anime';

export interface IAnimeRepository {
  getAnime(id: number): Promise<Anime[]>;
  getFilteredAnime(filters: any, order_dir : any, busqueda: any, id: any, filter_by: any ): Promise<Anime[]>
}