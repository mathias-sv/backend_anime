import { IAnimeRepository } from '../../domain/interfaces/IAnimeRepository';
import { Anime } from '../../domain/entities/Anime';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
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
    const { browser, page } = await this.setupPuppeteer();

    await page.goto(`https://visortmo.com/library?_pg=1&page=${id}`, { waitUntil: 'domcontentloaded' });

    const elements = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('div.element'));
        return nodes.map(node => {
            const id = node.getAttribute('data-identifier');
            const link = node.querySelector('a')?.getAttribute('href');
            const styleContent = node.querySelector('.thumbnail style')?.textContent;
            const backgroundImageUrl = styleContent?.match(/url\(["']?(.*?)["']?\)/i)?.[1];
            const name = node.querySelector('h4.text-truncate')?.getAttribute('title');
            const bookType = node.querySelector('.book-type')?.textContent;
            const demographyNode = node.querySelector('.demography');
            const genero = {
                title: demographyNode?.textContent,
                description: demographyNode?.getAttribute('title')
            };
            return { id, link, backgroundImageUrl, name, bookType, genero };
        });
    });

    await browser.close();
    return elements.map(element => new Anime(element.id, element.name, element.link, element.bookType, element.genero, element.backgroundImageUrl));
  }
  async getFilteredAnime(busqueda: string, filters?: string, order_dir?: string, pages?: number, filter_by?: string, filtros?: string): Promise<Anime[]> {
    const { browser, page } = await this.setupPuppeteer();
    let filtrosString = '';
    console.log(filtros);
    if (filtros) {
        let filtrosArray = filtros.split(',');
        console.log(filtrosArray);
        filtrosString = filtrosArray.map(filtro => `&genders%5B%5D=${filtro}`).join('');
    }
    const url = `https://visortmo.com/library?order_item=${filters}&order_dir=${order_dir}&title=${busqueda}&_pg=1&filter_by=${filter_by}&type=&demography=&status=&translation_status=&webcomic=&yonkoma=&amateur=&erotic=&page=${pages}${filtrosString}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const elements = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('div.element'));
        return nodes.map(node => {
            const id = node.getAttribute('data-identifier');
            const link = node.querySelector('a')?.getAttribute('href');
            const styleContent = node.querySelector('.thumbnail style')?.textContent;
            const backgroundImageUrl = styleContent?.match(/url\(["']?(.*?)["']?\)/i)?.[1];
            const name = node.querySelector('h4.text-truncate')?.getAttribute('title');
            const bookType = node.querySelector('.book-type')?.textContent;
            const demographyNode = node.querySelector('.demography');
            const genero = {
                title: demographyNode?.textContent,
                description: demographyNode?.getAttribute('title')
            };
            return { id, link, backgroundImageUrl, name, bookType, genero };
        });
    });
    await browser.close();
    return elements.map(element => new Anime(element.id, element.name, element.link, element.bookType, element.genero, element.backgroundImageUrl));
  }
  async getDescription(url: string){
    const { browser, page } = await this.setupPuppeteer();
    const urlanime = url;
    await page.goto(urlanime, { waitUntil: 'domcontentloaded' });
    const chapters = await page.$$eval('#chapters > ul > li', (chapters) => {
        return chapters.map((chapter) => {
          const numerocaps = chapter.querySelector('h4 > div > div.col-10.text-truncate > a').textContent;
          const editorials = Array.from(chapter.querySelectorAll('div > div > ul > li')).map(li => {
            let editorialName = li.querySelector('div > div.col-4.col-md-6.text-truncate > span').textContent;
            editorialName = editorialName.replace(/\s+/g, ' ').trim();
            const editorialLink = li.querySelector('div > div.col-2.col-sm-1.text-right > a')?.getAttribute('href');
            return { editorialName, editorialLink };
          });
          return { numerocaps, editorials };
        });
      });
    const additionalChapters = await page.$$eval('#chapters > ul > div > li', (additionalChapters) => {
        return additionalChapters.map((chapter) => {
          const numerocaps = chapter.querySelector('h4 > div > div.col-10.text-truncate > a').textContent;
          const editorials = Array.from(chapter.querySelectorAll('div > div > ul > li')).map(li => {
            let editorialName = li.querySelector('div > div.col-4.col-md-6.text-truncate > span').textContent;
            editorialName = editorialName.replace(/\s+/g, ' ').trim();
            const editorialLink = li.querySelector('div > div.col-2.col-sm-1.text-right > a')?.getAttribute('href');
            return { editorialName, editorialLink };
          });
          return { numerocaps, editorials};
        });
    });
    const chaptersArray = chapters.concat(additionalChapters);
    await browser.close();
    return chaptersArray;
  }
}