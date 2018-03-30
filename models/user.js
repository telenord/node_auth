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

module.exports.getUserById = (id, cb) => User.findById(id, cb);

module.exports.getUserByUsername = (username, cb) => {
  let i = User.findOne({username})
  console.log(i);
  // let i = User.findOne({username}, cb)
};
module.exports.comparePassword = (password, hash, cb) => bcrypt.compareSync(password, hash, (err, isMatch) => {
  cb(null, isMatch);
});
