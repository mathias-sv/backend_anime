import { AnimeService } from '../../application/services/AnimeService';
import { Controller, Get, Headers, Inject, Param, Query } from '@nestjs/common';

@Controller('anime')
export class AnimeController {
  private readonly animeService: AnimeService;
  constructor(@Inject('IAnimeService') animeService: AnimeService) {
    this.animeService = animeService;
  }
//endpoint para obtener animes
  @Get('id/:id')
  async getAnime(@Param('id') id: number) {
    try{
      const serviceresult = await this.animeService.getAnime(id);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
  //endpoint para realizar busquedas de animes con filtrado
  @Get('search')
  //ejemplo = http://localhost:3000/anime/search?busqueda=Naruto&filters=likes_count&order_dir=desc&pages=1&filter_by=title
  //busqueda = nombre el cual buscar 
  //filters = likes_count (Me gusta), alphabetically (orden alfabetico), score (puntuacion), creation (fecha de creacion), release_date (fecha de lanzamiento), num_chapters (numero de capitulos), num_volumes (numero de capitulos)
  //order_dir = desc (descendente), asc (ascendente)
  //pages = numero de paginas
  //filter_by = title (titulo), author (autor), company (compañia)
  //filtros valor de 1 - 94

  async getFilteredAnime(@Query('busqueda') busqueda: string, @Query('filters') filters?: string, @Query('order_dir') order_dir?: string, @Query('pages') pages?: number, @Query('filter_by') filter_by?: string, @Query('filtros') filtros?: string) {
    try{
      const serviceresult = await this.animeService.getFilteredAnime(busqueda, filters, order_dir, pages, filter_by, filtros);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
  //edpoint para obtener capitulos de un anime
  //header url = https://visortmo.com/library/manga/624/one-piece
  @Get('description')
  async getDescription(@Headers('url') url: string) {
    try{
      const serviceresult = await this.animeService.getDescription(url);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
  //trae las imagenes de la url
  @Get('image')
  async getImagenes(@Headers('url') url: string) {
    try{
      const serviceresult = await this.animeService.getImagenes(url);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
}