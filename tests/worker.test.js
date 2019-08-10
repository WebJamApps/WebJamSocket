const worker = require('../worker');

describe('worker class', () => {
  it('runs', async () => {
    let result;
    try {
      result = await worker.run();
      expect(result).toBe(true);
    } catch (e) { throw e; }
  });
});
