const controller = require('../../../model/tour/tour-controller');

describe('TourController', () => {
  it('deletes all tours', async () => {
    controller.model.deleteMany = jest.fn(() => Promise.resolve(true));
    const result = await controller.deleteAllDocs();
    expect(result).toBe(true);
  });
  it('throws error on deletes all tours', async () => {
    controller.model.deleteMany = jest.fn(() => Promise.reject(new Error('bad')));
    try { await controller.deleteAllDocs(); } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
  it('gets all tours sorted', async () => {
    controller.model.findSort = jest.fn(() => Promise.resolve(true));
    const result = await controller.getAllSort();
    expect(result).toBe(true);
  });
  it('throws error on gets all tours sorted', async () => {
    controller.model.findSort = jest.fn(() => Promise.reject(new Error('bad')));
    try { await controller.getAllSort(); } catch (e) {
      expect(e.message).toBe('bad');
    }
  });
});
