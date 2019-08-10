require('dotenv').config();
const mongoose = require('mongoose');

// let mongoUri = process.env.MONGO_HOST;
// /* istanbul ignore else */
// if (mongoUri === null || mongoUri === undefined) {
//   mongoUri = 'mongodb://valert:valert@ds233970.mlab.com:33970/test-valert';
// }
// use es6 default promise library in mongoose
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const mongoOptions = { keepAlive: 1, useNewUrlParser: true, autoIndex: true };
/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') mongoOptions.autoIndex = false;
mongoose.connect(process.env.MONGO_DB_URI, mongoOptions);
// its not worth refactoring this into a class just to get this error for a unit test
/* istanbul ignore next */
mongoose.connection.on('error', () => { throw new Error(`unable to connect to database: ${process.env.MONGO_DB_URI}`); });

module.exports = mongoose;
