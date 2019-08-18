const worker = require('../worker');

describe('worker class', () => {
  it('runs', async () => {
    let result;
    try { result = await worker.run(); } catch (e) {
      console.log(e.message);// eslint-disable-line no-console
      throw e;
    }
    expect(result).toBe(true);
  });
});
