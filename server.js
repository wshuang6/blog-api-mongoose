const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const {PORT, DATABASE_URL} = require('./config');
const {Blogpost} = require('./models');

app.use(bodyparser.json());

mongoose.Promise = global.Promise;

app.get('/posts', (req, res) => {
  Blogpost
    .find({})
    .exec()
    .then(blogposts => {
      const response = blogposts.map(post => post.apiRepr());
      // console.log(response);
      res.json(response);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'internal server error'})
    });
});

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