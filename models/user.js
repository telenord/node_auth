const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: String,
  email: String,
  name: String,
  profileimage: String,
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = (newUser, cb) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      newUser.password = hash;
      newUser.save(cb)
    });
  });
};

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
  User.findOne({username: username}, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    callback(null, isMatch);
  });
};
