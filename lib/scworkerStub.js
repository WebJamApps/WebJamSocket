class SCWorker {
  constructor() {
    this.options = { environment: 'test' };
    this.httpServer = { on() { return Promise.resolve(true); } };
    this.scServer = { on() { return Promise.resolve(true); } };
  }
}
module.exports = SCWorker;
