import { readdirSync, readFileSync, lstatSync, writeFileSync } from 'node:fs';
import { join, dirname, basename, extname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
// import { createLogger, transports, format } from 'winston';
import winston from 'winston';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { config } from 'dotenv';

// ESM version
// const __dirname = dirname(fileURLToPath(import.meta.url));
const __dirname = new URL('.', import.meta.url).pathname; // with trailing slash

config({ path: resolve(__dirname, '..', '.env') });

export const token = process.env.TOKEN;

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {

  const color = {
    debug: chalk.blue,
    info: chalk.blue.bind(chalk),
    warn: chalk.orange,
    error: chalk.red,
    log: chalk.blue,
  };

  return `${color[level](`${timestamp} [${chalk.bold(label)}]: `)} ${chalk.white(message)}`;
});

export function getLogger(service = 'overcaster') {
  return winston.createLogger({
    format: combine(
      label({ label: service }),
      timestamp(),
      myFormat,
      winston.format.splat(),
      // format.simple(),
      // format.colorize(),
    ),
    transports: [new winston.transports.Console()]
  });
}

const { info } = getLogger('utils');

const orderReccentFiles = (dir) =>
  readdirSync(dir)
    .filter(f => lstatSync(join(dir, f)).isFile())
    .map(file => ({ file, mtime: lstatSync(join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

const getMostRecentFile = (dir) => {
  const files = orderReccentFiles(dir);
  return files.length ? join(dir, files[0].file) : undefined;
};

// raw html data
const HTMLDataDirectory = resolve(__dirname, '..', './data/html');
// processed json files
const JSONDataDirectory = resolve(__dirname, '..', './data/json');

export function getLatestHTMLFile() {
  return getMostRecentFile(HTMLDataDirectory);
}

export function getLatestJSONFiles() {
  const files = orderReccentFiles(JSONDataDirectory);
  return files.length >= 2 ? [join(JSONDataDirectory, files[0].file), join(JSONDataDirectory, files[1].file)] : undefined;
}

export function savePodcastsHTML(html) {
  info('save podcast html');
  const date = dayjs().format('YYYY-MM-DD_HH-mm');
  const location = resolve(HTMLDataDirectory, `podcastsHtml_${date}.html`);
  writeFileSync(location, html);
  return location;
}

export function savePodcastsJSON(originalFilename, json) {
  info('save podcast json');
  const filename = basename(originalFilename, extname(originalFilename));
  const location = join(JSONDataDirectory, `${filename.replace('Html', 'Json')}.json`);
  writeFileSync(location, JSON.stringify(json));
  return location;
}

