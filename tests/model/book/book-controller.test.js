const controller = require('../../../model/book/book-controller');

describe('BookController', () => {
  it('deletes all books', async () => {
    controller.model.deleteMany = jest.fn(() => Promise.resolve(true));
    const result = await controller.deleteAllBooks();
    expect(result).toBe(true);
  });
  it('throws error on deletes all books', async () => {
    controller.model.deleteMany = jest.fn(() => Promise.reject(new Error('bad')));
    try { await controller.deleteAllBooks(); } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
  it('makes one book', async () => {
    controller.model.create = jest.fn(() => Promise.resolve(true));
    const result = await controller.makeOneBook();
    expect(result).toBe(true);
  });
  it('throws error on make one book', async () => {
    controller.model.create = jest.fn(() => Promise.reject(new Error('bad')));
    try { await controller.makeOneBook(); } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
});
