import { IAnimeRepository } from '../../domain/interfaces/IAnimeRepository';
import { Anime } from '../../domain/entities/Anime';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import cheerio from 'cheerio';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AnimeRepository implements IAnimeRepository {
  constructor(private httpService: HttpService) {}
  private async setupPuppeteer() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });
    return { browser, page };
  }
  async getAnime(id: number): Promise<Anime[]> {
    const url = `https://visortmo.com/library?_pg=1&page=${id}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const elements = [];
  
    $('div.element').each((i, element) => {
      const id = $(element).attr('data-identifier');
      const link = $(element).find('a').attr('href');
      const styleContent = $(element).find('.thumbnail style').text();
      const backgroundImageUrl = styleContent.match(/url\(["']?(.*?)["']?\)/i)?.[1];
      const name = $(element).find('h4.text-truncate').attr('title');
      const bookType = $(element).find('.book-type').text();
      const demographyNode = $(element).find('.demography');
      const genero = {
        title: demographyNode.text(),
        description: demographyNode.attr('title')
      };
      elements.push({ id, link, backgroundImageUrl, name, bookType, genero });
    });
  
    return elements.map(element => new Anime(element.id, element.name, element.link, element.bookType, element.genero, element.backgroundImageUrl));
  }
  async getFilteredAnime(busqueda: string, filters?: string, order_dir?: string, pages?: number, filter_by?: string, filtros?: string): Promise<Anime[]> {
    let filtrosString = '';
    console.log(filtros);
    if (filtros) {
        let filtrosArray = filtros.split(',');
        console.log(filtrosArray);
        filtrosString = filtrosArray.map(filtro => `&genders%5B%5D=${filtro}`).join('');
    }
    const url = `https://visortmo.com/library?order_item=${filters}&order_dir=${order_dir}&title=${busqueda}&_pg=1&filter_by=${filter_by}&type=&demography=&status=&translation_status=&webcomic=&yonkoma=&amateur=&erotic=&page=${pages}${filtrosString}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const elements = [];

    $('div.element').each((i, element) => {
        const id = $(element).attr('data-identifier');
        const link = $(element).find('a').attr('href');
        const styleContent = $(element).find('.thumbnail style').text();
        const backgroundImageUrl = styleContent.match(/url\(["']?(.*?)["']?\)/i)?.[1];
        const name = $(element).find('h4.text-truncate').attr('title');
        const bookType = $(element).find('.book-type').text();
        const demographyNode = $(element).find('.demography');
        const genero = {
            title: demographyNode.text(),
            description: demographyNode.attr('title')
        };
        elements.push({ id, link, backgroundImageUrl, name, bookType, genero });
    });

    return elements.map(element => new Anime(element.id, element.name, element.link, element.bookType, element.genero, element.backgroundImageUrl));
}
async getDescription(url: string){
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  let title = $('div.col-12.col-md-9.element-header-content-text > h1').text().trim().replace(/\s\s+/g, ' ');
  const description = $('p.element-description').text();
  const estado = $('span.book-status.publishing').text();
  const generos = [];
  $('div.col-12.col-md-9.element-header-content-text > h6').each((index, element) => {
      const anchor = $(element).find('a');
      generos.push({
          text: $(element).text(),
          href: anchor.length ? anchor.attr('href') : null
      });
  });
  const chapters = [];
  $('#chapters > ul > li').each((index, element) => {
      const numerocaps = $(element).find('h4 > div > div.col-10.text-truncate > a').text();
      const editorials = [];
      $(element).find('div > div > ul > li').each((i, li) => {
          let editorialName = $(li).find('div > div.col-4.col-md-6.text-truncate > span').text().replace(/\s+/g, ' ').trim();
          let editorialLink = $(li).find('div > div.col-2.col-sm-1.text-right > a').attr('href');
          if (editorialLink) {
              editorialLink = editorialLink.replace('https://visortmo.com', 'https://lectortmo.com');
          }
          editorials.push({ editorialName, editorialLink });
      });
      chapters.push({ numerocaps, editorials });
  });
  $('#chapters > ul > div > li').each((index, element) => {
      const numerocaps = $(element).find('h4 > div > div.col-10.text-truncate > a').text();
      const editorials = [];
      $(element).find('div > div > ul > li').each((i, li) => {
          let editorialName = $(li).find('div > div.col-4.col-md-6.text-truncate > span').text().replace(/\s+/g, ' ').trim();
          let editorialLink = $(li).find('div > div.col-2.col-sm-1.text-right > a').attr('href');
          if (editorialLink) {
              editorialLink = editorialLink.replace('https://visortmo.com', 'https://lectortmo.com');
          }
          editorials.push({ editorialName, editorialLink });
      });
      chapters.push({ numerocaps, editorials });
  });
  const result = { title, description, generos, estado, chapters };
  return result;
}
  async getImagenes(url: string){
    try {
      // Primera solicitud para obtener el enlace
      let data;
      while (true) {
        try {
          data = await axios.get(url, {
            headers: {
              'Referer': 'https://visortmo.com'
            }
          });
          break;
        } catch (error) {
          if (error.response && (error.response.status === 429 || error.response.status === 430)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo antes de reintentar
          } else {
            throw error;
          }
        }
      }
      console.log(data);
      let $ = cheerio.load(data.data);
      const link = $('#app > header > nav > div > div:nth-child(4) > a').attr('href');
      console.log(link);
      // Comprueba si el enlace existe antes de continuar
      if (!link) {
        console.log('Link not found, retrying...');
        return this.getImagenes(url); // Si el enlace es undefined, llama a la función de nuevo
      }
  
      // Segunda solicitud para ir al enlace y extraer las imágenes
      const newUrl = link;
      let newData;
      while (true) {
        try {
          const response = await axios.get(newUrl);
          newData = response.data;
          break;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo antes de reintentar
          } else {
            throw error;
          }
        }
      }
  
      const $new = cheerio.load(newData);
  
      const imgsinformat = await Promise.all(
        Array.from($new('#main-container > div')).map(async (div) => {
          const imgElement = $new(div).find('img');
          if (imgElement.length) {
            return imgElement.attr('data-src');
          }
        })
      );
  
      console.log(imgsinformat);
      return imgsinformat;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}