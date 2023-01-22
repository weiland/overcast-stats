import { readFile } from 'node:fs/promises';
import { parsePodcasts } from './src/parsers.js';
import { getLogger, getLatestHTMLFile, getLatestJSONFiles, savePodcastsHTML, savePodcastsJSON, token } from './src/utils.js';
import overcastClient from './src/overcast.js';

const { info } = getLogger('overcast-stats');

async function convertPodcasts(filename) {
  const podcasts = await readFile(filename, 'utf8');
  const parsed = parsePodcasts(podcasts);
  savePodcastsJSON(filename, parsed);
}

function getPodcastStats(currentPodcasts, beforePodcasts) {
  const current = currentPodcasts.map(p => p.url);
  const before = beforePodcasts.map(p => p.url);
  const added = current.filter(podcast => !before.includes(podcast));
  const deleted = before.filter(podcast => !current.includes(podcast));
  
  return {
    added,
    deleted,
  }
}

function getEpisodesStats(currentEpisodes, beforeEpisodes) {
  const current = new Map();
  const before = new Map();

  currentEpisodes.forEach(e => current.set(e.url, e))
  beforeEpisodes.forEach(e => before.set(e.url, e))

  const deleted = beforeEpisodes.filter(e => !current.has(e.url))
  const added = currentEpisodes.filter(e => !before.has(e.url))
  const timeChanged = currentEpisodes.filter(e =>
    !before.has(e.url)
      ? false
      : e.time !== before.get(e.url).time);

  
  return {
    added,
    deleted,
    timeChanged,
  }
}

async function downloadNewInformation() {
  const mrf = getLatestHTMLFile();
  const contents = await readFile(mrf, 'utf8');

  const client = await overcastClient({ token });
  const podcasts = await client.podcasts();

  if (podcasts === contents) {
    info('no new podcasts content');
    return;
  }

  info('new podcasts content!');
  const filename = savePodcastsHTML(podcasts);

  // const filename = await download(client);
  await convertPodcasts(filename);
}

async function updatePodcasts() {

  await downloadNewInformation();

  info('compare last two json files');

  const [currentFile, beforeFile] = getLatestJSONFiles();

  const current = JSON.parse(await readFile(currentFile))
  const before = JSON.parse(await readFile(beforeFile));

  console.log('current', current.podcasts.length, current.episodes.length, current.playedPodcasts.length);
  console.log('before', before.podcasts.length, before.episodes.length, before.playedPodcasts.length);
  console.log(getEpisodesStats(current.episodes, before.episodes));
  console.log(getPodcastStats(current.podcasts, before.podcasts));
  console.log(getPodcastStats(current.playedPodcasts, before.playedPodcasts));

  const allPodcasts = [...before.podcasts, ...current.podcasts]

  console.log('all Podcasts (count)', allPodcasts.length);

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
