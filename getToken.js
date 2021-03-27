// if EMAIL and PASSWORD are stored in the `.env` file.
require('dotenv').config();

const overcastClient = require('./src/overcast.js');

const main = async () => {

  // your login information
  // const data = { email: process.env.EMAIL, password: process.env.PASSWORD };
  // const { getToken } = await overcastClient(data);
  // const token = await getToken(data);

  // You can use obtainToken to immediately return the token instead of the client
  // so you can skip calling the getToken method.
  const data = { email: process.env.EMAIL, password: process.env.PASSWORD, obtainToken: true };
  const token = await overcastClient(data);
  
  console.log({ token });
};

main().catch(err => console.error('Error while obtaining token:', err));
