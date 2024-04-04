const Listing = require('../models/listing');

module.exports.search = async (req, res) => {
  try {
    const searchQuery = req.query.searchquery;
    // Check if the search query is empty
    if (!searchQuery) {
      return res.status(400).send('Search query cannot be empty');
    }
    // Search for listings with titles, descriptions, or locations containing the search query
    const filteredListings = await Listing.find({
      $or: [
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        { description: { $regex: new RegExp(searchQuery, 'i') } },
        { location: { $regex: new RegExp(searchQuery, 'i') } },
      ],
    }).exec(); // Adding exec() to actually execute the query

    if (filteredListings.length === 0) {
      req.flash('error', `${searchQuery} Listing does not exist`);
      res.redirect('/listings');
    }
    res.render('listings/index.ejs', {
      currentUser: res.locals.currentUser,
      allListings: filteredListings,
    });
  } catch (error) {
    next();
    // console.error('Error searching listings:', error);
    // res.status(500).send('Internal server error');
  }
};
