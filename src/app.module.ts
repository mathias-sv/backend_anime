import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AnimeController } from './Anime/infrastructure/controllers/AnimeController';
import { AnimeService } from './Anime/application/services/AnimeService';
import { AnimeRepository } from './Anime/infrastructure/repositories/AnimeRepository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController ,AnimeController],
  providers: [
    {
      provide: 'IAnimeService',
      useClass: AnimeService,
    },
    {
      provide: 'IAnimeRepository',
      useClass: AnimeRepository,
    }
  ],
})
export class AppModule {}
