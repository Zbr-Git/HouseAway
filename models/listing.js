const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');
const { string } = require('joi');

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,  
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Define a post middleware function for the 'findOneAndDelete' hook of the listingSchema
listingSchema.post('findOneAndDelete', async (listing) => {
  // Check if a listing document was found and deleted
  if (listing) {
    // If a listing exists, delete all associated reviews
    // Delete reviews where the _id matches any value in the listing's reviews array
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
