const debug = require('debug')('WebJamSocket:SocketController');
const bookController = require('../model/book/book-controller');
const tourController = require('../model/tour/tour-controller');
const tourData = require('../tour.json');

const { tour } = tourData;
class SocketController {
  constructor(scServer) {
    this.bookController = bookController;
    this.tourController = tourController;
    this.count = 0;
    this.scServer = scServer;
  }

  routing() {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      this.bookController.deleteAllDocs().then(async () => {
        debug('deleted');
        await this.bookController.createDocs({ title: 'first book', type: 'test' });
      });
      this.tourController.deleteAllDocs().then(() => {
        this.tourController.createDocs(tour);
      });
    }
    // In here we handle our incoming realtime connections and listen for events.
    this.scServer.on('connection', (socket) => {
      debug('client connection');
      socket.on('sampleClientEvent', (data) => {
        this.count += 1;
        debug(`Handled sampleClientEvent: ${data}`);
        this.scServer.exchange.publish('sample', this.count);
      });
      const interval = setInterval(() => {
        socket.emit('random', {
          number: Math.floor(Math.random() * 5),
        });
      }, 1000);
      socket.on('disconnect', () => {
        this.count -= 1;
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') clearInterval(interval);
        this.scServer.exchange.publish('sample', this.count);
      });
      socket.on('getTours', async () => {
        let allTours;
        try { allTours = await this.tourController.getAll(); } catch (e) { debug(e.message); throw e; }
        socket.emit('allTours', allTours);
      });
    });
    return Promise.resolve(true);
  }
}
module.exports = SocketController;
