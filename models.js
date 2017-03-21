const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: {type: String, unique: true, required: true},
  author: {
    firstName: String,
    lastName: String, 
  },
  content: {type: String, required: true},
  created: {type: Date, default: Date.now}
});

blogSchema.virtual('fullAuthorName').get(function () {
  return `${this.author.firstName} ${this.author.lastName}`;
});

blogSchema.methods.apiRepr = function() {
  console.log(this);
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    created: this.created,
    author: this.fullAuthorName
  }
}

const Blogpost = mongoose.model('Blogpost', blogSchema);

module.exports = {Blogpost};