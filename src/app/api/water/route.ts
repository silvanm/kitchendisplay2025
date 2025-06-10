import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const POOL_URL = process.env.POOL_TEMP_URL!;
const LAKE_URL = process.env.LAKE_TEMP_URL!;
const RIVER_URL = process.env.RIVER_TEMP_URL!;

// Helper function to fetch and parse text
async function fetchText(url: string) {
  const response = await fetch(url, { next: { revalidate: 900 } }); // Revalidate every 15 mins
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

// Scraper for Pool Temperature
async function getPoolTemp(): Promise<number | null> {
  try {
    const html = await fetchText(POOL_URL);
    const $ = cheerio.load(html);
    const tempText = $('.col-3:contains("Letzigraben")').next().next().text();
    const tempMatch = tempText.match(/(\d+)\s*°C/);
    return tempMatch ? parseInt(tempMatch[1], 10) : null;
  } catch (error) {
    console.error('Error scraping pool temp:', error);
    return null;
  }
}

// Scraper for Lake Temperature
async function getLakeTemp(): Promise<number | null> {
  try {
    const html = await fetchText(LAKE_URL);
    const $ = cheerio.load(html);
    const tempText = $('table tr:nth-child(4) td:nth-child(3) table tr:nth-child(2) td:nth-child(3) span').text();
    const tempMatch = tempText.match(/(\d+[.,]\d+)/);
    return tempMatch ? parseFloat(tempMatch[0].replace(',', '.')) : null;
  } catch (error) {
    console.error('Error scraping lake temp:', error);
    return null;
  }
}

// Fetcher for River Temperature
async function getRiverTemp(): Promise<number | null> {
  try {
    const text = await fetchText(RIVER_URL);
    return parseFloat(text);
  } catch (error) {
    console.error('Error fetching river temp:', error);
    return null;
  }
}

export async function GET() {
  try {
    const [pool, lake, river] = await Promise.all([
      getPoolTemp(),
      getLakeTemp(),
      getRiverTemp(),
    ]);

    return NextResponse.json({ pool, lake, river });
  } catch (error) {
    console.error('Error fetching water temperatures:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 