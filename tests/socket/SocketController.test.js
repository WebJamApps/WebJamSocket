// const SocketController = require('../../socket/SocketController');

describe('SocketController', () => {
  // const clientStub = {
  //   emit: (name, data) => data,
  //   on: (name, func) => {
  //     func();
  //   },
  // };
  // const sServer = {
  //   exchange: { publish: () => {} },
  //   on: (name, func) => {
  //     func(clientStub);
  //   },
  // };
  it('is a placeholder', () => {
    expect(true).toBe(true);
  });
  // it('runs routing', async () => {
  //   const socketController = new SocketController(sServer);
  //   socketController.bookController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
  //   socketController.tourController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
  //   socketController.tourController.getAllSort = jest.fn(() => Promise.resolve(true));
  //   const result = await socketController.routing();
  //   jest.advanceTimersByTime(2000);
  //   expect(result).toBe(true);
  // });
  // it('runs routing but has error on getting the tours', async () => {
  //   const socketController = new SocketController(sServer);
  //   socketController.bookController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
  //   socketController.tourController.deleteAllDocs = jest.fn(() => Promise.resolve(true));
  //   socketController.tourController.getAllSort = jest.fn(() => Promise.reject(new Error('bad')));
  //   const result = await socketController.routing();
  //   jest.advanceTimersByTime(2000);
  //   expect(result).toBe(true);
  // });
});
