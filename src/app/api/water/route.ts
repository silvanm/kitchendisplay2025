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

async function getPoolTemp(): Promise<number> {
  const html = await fetchText(POOL_URL);

  // Map of locations and their regex patterns
  const locations: { [key: string]: RegExp } = {
    pool: /Letzigraben.*?(\d+)\s*°C/,
    // Add more locations as needed
  };

  const result: { [key: string]: number } = {};

  for (const [key, regex] of Object.entries(locations)) {
    const match = html.match(regex);
    result[key] = match ? parseInt(match[1], 10) : -1;
  }

  return result.pool;
}

// Scraper for Lake Temperature
async function getLakeTemp(): Promise<number | null> {
  try {
    const html = await fetchText(LAKE_URL);
    const $ = cheerio.load(html);

    // Anchor on the "Wassertemperatur" label rather than a brittle positional
    // nth-child path. In the "Aktuelle Werte" block the label and its value sit
    // together in a small table, e.g. "Wassertemperatur" / "19,5 °C". Match the
    // label element's OWN text exactly (not ancestor containers, which would
    // also contain the word), then read the °C value from the same table.
    const tempRegex = /([0-9]+[.,][0-9]+)\s*°C/;
    let temp: number | null = null;

    $('*')
      .filter((_, el) => {
        const own = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
        return /^wassertemperatur$/i.test(own);
      })
      .each((_, el) => {
        if (temp !== null) return;
        const match = $(el).closest('table').text().match(tempRegex);
        if (match) temp = parseFloat(match[1].replace(',', '.'));
      });

    if (temp === null) {
      // Log enough to distinguish "site changed" from "site down".
      console.error('Lake temp not found: "Wassertemperatur" label or value missing on page');
    }
    return temp;
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