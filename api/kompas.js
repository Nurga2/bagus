/**
 * KOMPAS TEKNO SCRAPER - Vercel Serverless
 * Standard: AngelaImut / SofiApis
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const URL_TARGET = 'https://indeks.kompas.com/?site=tekno';
  const author = "AngelaImut";

  // Header agar dianggap sebagai browser asli
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
  };

  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. Ambil HTML menggunakan Axios
    const response = await axios.get(URL_TARGET, { headers });
    const html = response.data;

    // 2. Load HTML ke Cheerio
    const $ = cheerio.load(html);
    const articles = [];

    // 3. Scraping data artikel
    $('.listSection .hlItem, .listSection .articleItem').each((_, el) => {
      const titleEl = $(el).find('.hlTitle, .articleTitle');
      const linkEl = $(el).find('a');
      
      const title = titleEl.text().trim();
      const link = linkEl.attr('href') || '';
      const date = $(el).find('.hlTime, .articlePost-date').text().trim();
      const category = $(el).find('.hlChannel, .articlePost-subtitle').text().trim();

      // Handle Image (termasuk data-src untuk lazy loading)
      const imgEl = $(el).find('img');
      const image = imgEl.attr('src') || imgEl.attr('data-src') || '';

      if (title && link) {
        articles.push({
          title,
          link,
          category,
          date,
          image
        });
      }
    });

    // 4. Output sesuai SofiApis Standard
    return res.status(200).json({
      status: true,
      author: author,
      total: articles.length,
      result: articles
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      author: author,
      error: 'Terjadi kesalahan: ' + error.message
    });
  }
}
