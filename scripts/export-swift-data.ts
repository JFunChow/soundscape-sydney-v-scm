/**
 * Exports the central sound-spot data (the single source of truth used by the
 * Expo app) into JSON resources consumed by the native iOS (Swift) app.
 *
 * Run with: bun scripts/export-swift-data.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  soundSpots,
  liveInfoById,
  categoryColors,
} from '../expo/data/sound-spots';
import { enrichmentById } from '../expo/data/enrichment';

const outDir = join(
  import.meta.dir,
  '..',
  'ios-soundscape-sydney',
  'SoundscapeSydney',
  'Resources'
);

const catalog = {
  categoryColors,
  spots: soundSpots,
  liveInfo: liveInfoById,
  enrichment: enrichmentById,
};

mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'catalog.json');
writeFileSync(outPath, JSON.stringify(catalog, null, 2));

console.log(
  `Wrote ${soundSpots.length} spots, ${Object.keys(liveInfoById).length} live-info entries, ` +
    `${Object.keys(enrichmentById).length} enrichment entries -> ${outPath}`
);
