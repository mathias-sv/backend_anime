import { AnimeService } from '../../application/services/AnimeService';
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';

@Controller('anime')
export class AnimeController {
  private readonly animeService: AnimeService;
  constructor(@Inject('IAnimeService') animeService: AnimeService) {
    this.animeService = animeService;
  }

  @Get('id/:id')
  async getAnime(@Param('id') id: number) {
    try{
      const serviceresult = await this.animeService.getAnime(id);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
  @Get('search')
  //ejemplo = http://localhost:3000/anime/search?busqueda=Naruto&filters=likes_count&order_dir=desc&pages=1&filter_by=title
  //busqueda = nombre el cual buscar 
  //filters = likes_count (Me gusta), alphabetically (orden alfabetico), score (puntuacion), creation (fecha de creacion), release_date (fecha de lanzamiento), num_chapters (numero de capitulos), num_volumes (numero de capitulos)
  //order_dir = desc (descendente), asc (ascendente)
  //pages = numero de paginas
  //filter_by = title (titulo), author (autor), company (compañia)
  async getFilteredAnime(@Query('busqueda') busqueda: string, @Query('filters') filters?: string, @Query('order_dir') order_dir?: string, @Query('pages') pages?: number, @Query('filter_by') filter_by?: string, @Query('filtros') filtros?: string) {
    try{
      const serviceresult = await this.animeService.getFilteredAnime(busqueda, filters, order_dir, pages, filter_by, filtros);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
}