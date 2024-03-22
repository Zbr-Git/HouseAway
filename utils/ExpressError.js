class ExpressError extends Error {
    constructor(statusCode, message) {
      super(); // Call the super constructor of the Error class
      this.statusCode = statusCode;
      this.message = message;
    }
  }
  
  module.exports = ExpressError;
  