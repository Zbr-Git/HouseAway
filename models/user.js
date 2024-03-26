const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// Passport-Local Mongoose automatically handles the setup of username, password with salting and hashing.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
