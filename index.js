const { readFile } = require('fs').promises;
// const download = require('./src/download.js');
const { parsePodcasts } = require('./src/podcastParser.js');
const { getLogger, getLatestHTMLFile, getLatestJSONFiles, savePodcastsHTML, savePodcastsJSON } = require('./src/utils.js');
const overcastClient = require('./src/overcast.js');
const { info } = getLogger('overcast-stats');

require('dotenv').config();

// const download = async (client) => savePodcastsHTML(await client.podcasts()) ;

async function convertPodcasts(filename) {
  const podcasts = await readFile(filename, 'utf8');
  const parsed = parsePodcasts(podcasts);
  savePodcastsJSON(filename, parsed);
}

async function updatePodcasts() {
  const mrf = getLatestHTMLFile();
  const contents = await readFile(mrf, 'utf8');

  const client = await overcastClient({ token: process.env.TOKEN });
  const podcasts = await client.podcasts();

  if (podcasts === contents) {
    info('no new podcasts content');
    return;
  }

  info('new podcasts content!');
  const filename = savePodcastsHTML(podcasts);

  // const filename = await download(client);
  await convertPodcasts(filename);

  const [currentFile, beforeFile] = getLatestJSONFiles();

  const current = JSON.parse(await readFile(currentFile))
  const before = JSON.parse(await readFile(beforeFile));

  // new played podcasts
  
  // new podcasts
  
  // length same?
  // new episode?
  // changed episode?
  // finished episode?

  return current;
}

  // console.log(await client.episode('/+DDLMaLc'));
  // console.log(await client.podcast('itunes899384794'));

const main = async () => {
  info('Update Podcasts');
  await updatePodcasts();
};

main().catch(err => console.error(err));
