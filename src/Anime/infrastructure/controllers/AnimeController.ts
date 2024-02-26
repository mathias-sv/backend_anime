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
  async getFilteredAnime(@Query('busqueda') busqueda: string, @Query('filters') filters?: string, @Query('order_dir') order_dir?: string, @Query('id') id?: number, @Query('filter_by') filter_by?: string) {
    try{
      const serviceresult = await this.animeService.getFilteredAnime(busqueda, filters, order_dir, id, filter_by);
      return serviceresult
    }catch(e){
      throw e;
    }
  }
}