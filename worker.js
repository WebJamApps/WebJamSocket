require('dotenv').config();

let SCWorker;
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') SCWorker = require('socketcluster/scworker'); // eslint-disable-line global-require
else SCWorker = require('./lib/scworkerStub'); // eslint-disable-line global-require
const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const morgan = require('morgan');
const healthChecker = require('sc-framework-health-check');
const debug = require('debug')('WebJamSocket:worker');
const controller = require('./model/book/book-controller');

class Worker extends SCWorker {
  run() {
    debug('   >> Worker PID:', process.pid);
    const { environment } = this.options;
    require('./model/db'); // eslint-disable-line global-require
    const app = express();
    const { httpServer } = this;
    const { scServer } = this;

    if (environment === 'dev') {
      // Log every HTTP request. See https://github.com/expressjs/morgan for other
      // available formats.
      app.use(morgan('dev'));
    }
    app.use(serveStatic(path.resolve(__dirname, 'public')));

    // Add GET /health-check express route
    healthChecker.attach(this, app);

    httpServer.on('request', app);

    let count = 0;
    debug('worker');
    controller.makeOneBook({ title: 'first book', type: 'test' });
    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', (socket) => {
      debug('client connection');
      // Some sample logic to show how to handle client events,
      // replace this with your own logic

      socket.on('sampleClientEvent', (data) => {
        count += 1;
        debug(`Handled sampleClientEvent: ${data}`);
        scServer.exchange.publish('sample', count);
      });

      const interval = setInterval(() => {
        socket.emit('random', {
          number: Math.floor(Math.random() * 5),
        });
      }, 1000);

      socket.on('disconnect', () => {
        count -= 1;
        clearInterval(interval);
        scServer.exchange.publish('sample', count);
      });
    });
    return Promise.resolve(true);
  }
}

module.exports = new Worker();
