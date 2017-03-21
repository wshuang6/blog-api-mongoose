const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const {PORT, DATABASE_URL} = require('./config');

app.use(bodyparser.json());

mongoose.Promise = global.Promise;



let server;
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`listening on port ${port}`);
        resolve;
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      })
    })
  })
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      })
    })
  })
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};