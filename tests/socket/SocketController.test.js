const SocketController = require('../../socket/SocketController');

describe('SocketController', () => {
  jest.useFakeTimers();
  const clientStub = {
    emit: (name, data) => data,
    on: (name, func) => {
      func();
    },
  };
  const sServer = {
    exchange: { publish: () => {} },
    on: (name, func) => {
      func(clientStub);
    },
  };
  it('runs routing', async () => {
    const socketController = new SocketController(sServer);
    socketController.bookController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
    socketController.tourController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
    socketController.tourController.getAllSort = jest.fn(() => Promise.resolve(true));
    const result = await socketController.routing();
    jest.advanceTimersByTime(2000);
    expect(result).toBe(true);
  });
  it('runs routingbut has error on getting the tours', async () => {
    const socketController = new SocketController(sServer);
    socketController.bookController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
    socketController.tourController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
    socketController.tourController.getAllSort = jest.fn(() => Promise.reject(new Error('bad')));
    const result = await socketController.routing();
    jest.advanceTimersByTime(2000);
    expect(result).toBe(true);
  });
});
