const debug = require('debug')('WebJamSocket:SocketController');
const bookController = require('../model/book/book-controller');
const tourController = require('../model/tour/tour-controller');
const tourData = require('../tour');

const { tour } = tourData;
class SocketController {
  constructor(scServer) {
    this.bookController = bookController;
    this.tourController = tourController;
    this.count = 0;
    this.scServer = scServer;
  }

  errorHandler(e, socket) { // eslint-disable-line class-methods-use-this
    debug(e.message); socket.emit('error', `${e.message}`); return Promise.resolve(e.message);
  }

  routingContinued(socket) {
    const interval = setInterval(() => {
      socket.emit('random', { number: Math.floor(Math.random() * 5) });
    }, 1000);
    socket.on('disconnect', () => {
      this.count -= 1;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'test') clearInterval(interval);
      this.scServer.exchange.publish('sample', this.count);
    });
    socket.on('getTours', async () => {
      let allTours;
      try { allTours = await this.tourController.getAllSort({ datetime: -1 }); } catch (e) {
        return this.errorHandler(e, socket);
      }
      return socket.emit('allTours', allTours);
    });
  }

  routing() {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      this.bookController.deleteAllDocs().then(async () => {
        debug('deleted');
        try {
          await this.bookController.createDocs({ title: 'first book', type: 'test' });
          await this.tourController.deleteAllDocs();
          await this.tourController.createDocs(tour);
        } catch (e) { debug(e.message); return Promise.resolve(e.message); }
        return Promise.resolve(true);
      });
    }
    // In here we handle our incoming realtime connections and listen for events.
    this.scServer.on('connection', (socket) => {
      socket.on('newTour', async (data) => {
        let newTour;
        try { newTour = await this.tourController.createDocs(data.tour); } catch (e) {
          return this.errorHandler(e, socket);
        }
        debug(newTour);
        this.scServer.exchange.publish('tourCreated', newTour);
        return Promise.resolve(newTour);
      });
      socket.on('sampleClientEvent', (data) => {
        this.count += 1;
        debug(`Handled sampleClientEvent: ${data}`);
        this.scServer.exchange.publish('sample', this.count);
      });
      this.routingContinued(socket);
    });
    return Promise.resolve(true);
  }
}
module.exports = SocketController;
