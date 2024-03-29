import { Anime } from "@/Anime/domain/entities/Anime";

export interface IAnimeService {
  getAnime(id: number): Promise<Anime[]>;
  getFilteredAnime(filters: any, order_dir: string, busqueda: string, pages: number, filter_by: string): Promise<Anime[]>;
}