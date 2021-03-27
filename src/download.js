const { savePodcastsHTML } = require('./utils.js');

const download = async (client) => savePodcastsHTML(await client.podcasts()) ;

module.exports = download;
