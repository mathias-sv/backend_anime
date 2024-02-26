import { IAnimeRepository } from '../../domain/interfaces/IAnimeRepository';
import { Anime } from '../../domain/entities/Anime';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AnimeRepository implements IAnimeRepository {
  constructor(private httpService: HttpService) {}

  async getAnime(id: number): Promise<Anime[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Desactivar la carga de imágenes
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });

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
  async getFilteredAnime(busqueda: string, filters?: string, order_dir?: string, pages?: number, filter_by?: string): Promise<Anime[]> {
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
  
    const url = `https://visortmo.com/library?order_item=${filters}&order_dir=${order_dir}&title=${busqueda}&_pg=1&filter_by=${filter_by}&type=&demography=&status=&translation_status=&webcomic=&yonkoma=&amateur=&erotic=&page=${pages}`;
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
}