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
    .find({}, {'_id': 0})
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

app.get('/posts/:id', (req, res) => {
  Blogpost
    .findById(`${req.params.id}`)
    .exec()
    .then(blogposts => res.json(blogposts.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'internal server error'});
    });
});

app.post('/posts', (req, res) => {
  console.log(req.body);
  const required = ['title', 'content', 'author'];
  const requiredAuthor = ['firstName', 'lastName']
  function testRequiredFields (required, field) {
    for (var i = 0; i < required.length; i++) {
    if (!(required[i] in field)) {
      res.status(400).send(`Missing ${required[i]}`);
    }
  }}
  testRequiredFields(required, req.body);
  testRequiredFields(requiredAuthor, req.body.author);
  Blogpost
    .create({
      title: req.body.title,
      author: req.body.author,
      content: req.body.content,
      created: Date.now()
    })
    .then(param => res.status(201).json(param.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'internal server error'});
    });
})

app.delete('/posts/:id', (req, res)=>{
  Blogpost
    .findByIdAndRemove(`${req.params.id}`)
    .exec()
    .then(() => {console.log(`Deleted post ${req.params.id}`); 
      res.status(204).end()})
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'internal server error'});
    });
})

app.put('/posts/:id', (req, res)=>{
  if ((req.body.id !== req.params.id) || req.body.id === false) {
    res.status(400).json(`Body and parameter id must match`)
  }
  Blogpost
    .findByIdAndUpdate(`${req.params.id}`, {
      $set: req.body
    })
    .exec()
    .then(() => {return Blogpost.findById(req.params.id)})
    .then(param => res.status(201).json(param.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'internal server error'});
    });
})

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