
describe('server', () => {
  it('is defines the server', (done) => {
    const server = require('../server'); // eslint-disable-line global-require
    expect(server).toBeDefined();
    done();
  });
});
