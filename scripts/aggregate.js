import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const storePath = path.join(root, 'data', 'responses.json');

const ensureStore = () => {
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, '[]', 'utf-8');
  }
};

const count = (records, key) => {
  const tally = new Map();
  records.forEach((rec) => {
    if (!rec.answers || !rec.answers[key]) return;
    const value = rec.answers[key];
    if (Array.isArray(value)) {
      value.forEach((v) => tally.set(v, (tally.get(v) || 0) + 1));
    } else if (typeof value === 'object') {
      Object.values(value).forEach((v) => tally.set(v, (tally.get(v) || 0) + 1));
    } else {
      tally.set(value, (tally.get(value) || 0) + 1);
    }
  });
  return tally;
};

const printMap = (label, map) => {
  console.log(`\n${label}`);
  map.forEach((value, key) => console.log(`- ${key}: ${value}`));
};

const main = () => {
  ensureStore();
  const raw = fs.readFileSync(storePath, 'utf-8');
  const records = JSON.parse(raw);
  console.log(`Loaded ${records.length} stored responses from ${storePath}`);

  const trust = count(records, 'trustPrimitive');
  const threats = count(records, 'worstThreat');
  const profit = count(records, 'profitRole');
  const adoption = count(records, 'adoptionTarget');

  printMap('Trust primitive', trust);
  printMap('Worst-case threat', threats);
  printMap('Profit stance', profit);
  printMap('Adoption target', adoption);
};

if (process.argv.includes('--dry-run')) {
  console.log('Dry run: not reading or writing anything beyond ensuring storage file exists.');
  ensureStore();
  process.exit(0);
}

main();
