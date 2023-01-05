import FormData from 'form-data';

const HOSTNAME = 'https://overcast.fm';
const LOGIN_URL = 'https://overcast.fm/login';


export default async function overcast({ token, email, password, obtainToken }) {

  if (email && password) {
    token = await getToken({ email, password });

    if (obtainToken) {
      return token;
    }
  }

  if (!token) {
    throw new Error('You have to provide a `token` or `email` and `password` to the Overcast client.');
  }

  async function getToken({ email, password }) {

    const form = new FormData();
    form.append('email', email);
    form.append('password', password);

    const { headers } = await fetch(LOGIN_URL, { body: form, method: 'post' });

    console.log(headers);

    const cookie = headers['set-cookie'];

    if (!cookie) {
      throw new Error('getToken: Login was not successful.');
    }

    const token = cookie[0].split(';')[0].split('o=')[1];

    return token;
  }


  async function get(url) {
    const result = await fetch(`${HOSTNAME}${url}`, {
      headers: {
        'Cookie': `o=${token}`,
      },
    });
    const body = await response.text();

    return { body };
  };

  async function podcasts() {
    const { body } = await get('podcasts');
    return body;
  }

  async function podcast(podcast) {
    const { body } = await get(podcast);
    return body;
  }

  async function episode(episode) {
    if (episode.startsWith('/')) {
      episode = episode.substr(1);
    }
    const { body } = await get(episode);
    return body;
  }

  async function opml() {
    const { body } = await get('account/export_opml');
    return body;
  }

  async function opmlExtended() {
    const { body } = await get('account/export_opml/extended');
    return body;
  }

  async function post(url, form) {
    return fetch(url, { method: 'post', body: form }).then(r => r.text());
  }

  async function changeEmail(email) {
    // const { body } = await get('account/email'); // find name=ct
    const ct = '';
    const form = new FormData();
    form.append('ct', ct);
    form.append('email', email);
    const body = await post('account/email');
    return body;
  }

  async function changePassword({ currentPassword, newPassword, newPasswordRepeated }) {
    // const { body } = await get('account/password'); // find name=ct
    const ct = '';
    const form = new FormData();
    form.append('ct', ct);
    form.append('password1', currentPassword);
    form.append('password2', newPassword);
    form.append('password3', newPasswordRepeated);
    const body = await post('account/password', form);
    return body;
  }

  async function deleteAccount() {
    const { body } = await get('account/delete');
    return body;
  }
  
  async function logout() {
    // This does not seem to invalidate the token on the serverside.
    const { body } = await get('logout');
    return body;
  }

  const api = {
    getToken, // login, will most likely be not used
    podcasts,
    podcast,
    episode,
    opml,
    opmlExtended,
    logout,
  };
  
  return api;
}
