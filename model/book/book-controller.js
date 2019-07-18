const debug = require('debug')('WebJamSocket:book-controller');
const Controller = require('../../lib/controller');
const bookModel = require('./book-facade');

class BookController extends Controller {
  findCheckedOut(req, res) {
    return this.model.find({ checkedOutBy: req.params.id })
      .then(collection => res.status(200).json(collection));
  }

  async makeOneBook(body) {
    let result;
    try { result = await this.model.create(body); } catch (e) {
      throw e;
    }debug(result);
  }
}

module.exports = new BookController(bookModel);
