import { Anime } from '../entities/Anime';

export interface IAnimeRepository {
  getAnime(id: number): Promise<Anime[]>;
  getFilteredAnime(filters: any, order_dir : any, busqueda: any, pages: any, filter_by: any, filtros: any): Promise<Anime[]>
  getDescription(url: string);
}