import app from './app';

require('dotenv').config();

app.listen(process.env.PORT, () =>
  console.log(`Server is listening ${process.env.PORT}`)
);
