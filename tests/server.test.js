
describe('server', () => {
  it('is defines the server', () => new Promise((done) => {
    const server = require('../server'); // eslint-disable-line global-require
    expect(server).toBeDefined();
    done();
  }));
});
