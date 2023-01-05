# [Overcast App Podcasts listening statistics](https://github.com/weiland/overcast-stats/)

> Create your own podcast listening statistics by regularly downloading your podcast information from overcast.fm

## Installation

```sh
npm install

# or
yarn
```

## Setup

You have to enter your Overcast Token into the `.env` file.
The Overcast Token is the Cookie `o` when you are logged in.

```sh
cp .env.example .env

# then edit the file and add your token
vim .env
```

<details>
<summary>You can obtain the token by running following script:</summary>

```js
const overcastClient = require('./src/overcast.js');

const main = async () => {

  // your login information
  const data = { email: 'em@il', password: 'password' };

  const client = await overcastClient(data);

  const token = client.getToken(data);
  
  console.log({ token });
};

main().catch(err => console.error(err));

```

</details>

## Run

```command
node index.js
```

## Features

- see when new podcasts episodes are published
- see when you started and ended listening to an episode
- see total hours listened (might vary due to SmartSpeed etc)

## License

ISC
