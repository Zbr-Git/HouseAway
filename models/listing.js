const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      'https://plus.unsplash.com/premium_photo-1679517155948-4b6c8d26cbd5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    set: (v) =>
      v === ''
        ? 'https://plus.unsplash.com/premium_photo-1679517155948-4b6c8d26cbd5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        : v,
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
