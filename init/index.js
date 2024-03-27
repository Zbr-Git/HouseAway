const mongoose = require('mongoose');
const initData = require('./data');
const Listing = require('../models/listing');

const MONGO_URL = 'mongodb://127.0.0.1:27017/listingdb';

main()
  .then((res) => console.log('Database Connection Successful'))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: '6603bc7be699ce6eb7e7d1ed',
    }));
    await Listing.insertMany(initData.data);
    console.log('Data was initialized');
  } catch (err) {
    console.error('Error initializing data:', err);
  }
};

initDB();
