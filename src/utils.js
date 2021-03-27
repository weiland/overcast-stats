const { readdirSync, readFileSync, lstatSync, writeFileSync } = require('fs');
const { join, dirname, basename, extname } = require('path');
const { createLogger, transports, format } = require('winston');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { combine, timestamp, label, printf } = format;

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

function getLogger(service = 'overcaster') {
  return createLogger({
    format: combine(
      label({ label: service }),
      timestamp(),
      myFormat,
      format.splat(),
      // format.simple(),
      // format.colorize(),
    ),
    transports: [new transports.Console()]
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
const HTMLDataDirectory = './data/html';
// processed json files
const JSONDataDirectory = './data/json';

function getLatestHTMLFile() {
  return getMostRecentFile(HTMLDataDirectory);
}

function getLatestJSONFiles() {
  const files = orderReccentFiles(dir);
  return files.length >= 2 ? [join(dir, files[0].file), join(dir, files[1].file)] : undefined;
}

function savePodcastsHTML(html) {
  info('save podcast html');
  const date = dayjs().format('YYYY-MM-DD_HH-mm');
  const location = `${HTMLDataDirectory}/podcastsHtml_${date}.html`;
  writeFileSync(location, html);
  return location;
}

function savePodcastsJSON(originalFilename, json) {
  info('save podcast json');
  const filename = basename(originalFilename, extname(originalFilename));
  const location = join(JSONDataDirectory, `${filename.replace('Html', 'Json')}.json`);
  writeFileSync(location, JSON.stringify(json));
  return location;
}

exports.getLogger = getLogger;
exports.getLatestHTMLFile = getLatestHTMLFile;
exports.getLatestJSONFiles = getLatestJSONFiles;
exports.savePodcastsHTML = savePodcastsHTML;
exports.savePodcastsJSON = savePodcastsJSON;
