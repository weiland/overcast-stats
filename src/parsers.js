const { load } = require('cheerio');
const dayjs = require('dayjs');

const { info, error } = require('./utils.js').getLogger('podcast-parser');

function parseEpisode(anchor) {
  const url = anchor.attr('href');
  const cover = anchor.find('.art').attr('src');
  const title = anchor.find('.title').text();
  const [_date, _timeLeft] = anchor.find('.caption2').text().trim().split(' • ');

  const date = _date.includes(',') ? _date : `${_date}, ${dayjs().year()}`;
  const timeLeft = _timeLeft ? _timeLeft : '0';

  const isStarted = timeLeft.includes('left');

  return {
    url,
    cover,
    title,
    date: dayjs(date, 'MMM D, YYYY').format(),
    time: timeLeft.replace(' left', ''),
    isStarted,
  };
}

function parsePodcasts(anchor) {
  const url = anchor.attr('href');
  const cover = anchor.find('.art').attr('src');
  const title = anchor.find('.title').text();

  return {
    url,
    cover,
    title,
  };
}

const ae = 'All Episodes';
const p = 'Podcasts';
const pp = 'Played Podcasts';


function parseAllData(html) {

  info('parse podcasts (all left episodes and podcasts)');

  const $ = load(html);

  const episodes = [];
  const podcasts = [];
  const playedPodcasts = [];

  let status;
  const children = $('.pure-u-sm-3-5').children();
  children.each(function (_i, _elem) {
    const elem = $(this);
    if (elem.is('h2.ocseparatorbar')) {
      status = elem.text();
      info(status);
      return;
    }

    if (elem.is('.episodecell')) {
      episodes.push(parseEpisode(elem));
      return;
    }

    if (elem.is('.feedcell')) {
      const parsed = parsePodcasts(elem);
      if (status === p) {
        podcasts.push(parsed);
      } else {
        playedPodcasts.push(parsed);
      }
      return;
    }

    error('There is an unknown element.');
  });

  return {
    episodes,
    podcasts,
    playedPodcasts,
  };
}

exports.parsePodcasts = parseAllData;
