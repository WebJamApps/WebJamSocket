/*
  This is the SocketCluster master controller file.
  It is responsible for bootstrapping the SocketCluster master process.
  Be careful when modifying the options object below.
  If you plan to run SCC on Kubernetes or another orchestrator at some point
  in the future, avoid changing the environment variable names below as
  each one has a specific meaning within the SC ecosystem.
*/

require('dotenv').config();
// const fs = require('fs');
const debug = require('debug')('WebJamSocket:server');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const scHotReboot = require('sc-hot-reboot');
const fsUtil = require('socketcluster/fsutil');
const SocketCluster = require('socketcluster');

const { waitForFile } = fsUtil;

const workerControllerPath = argv.wc || process.env.SOCKETCLUSTER_WORKER_CONTROLLER;
const brokerControllerPath = argv.bc || process.env.SOCKETCLUSTER_BROKER_CONTROLLER;
const workerClusterControllerPath = argv.wcc || process.env.SOCKETCLUSTER_WORKERCLUSTER_CONTROLLER;

const options = {
  workers: Number(argv.w) || Number(process.env.SOCKETCLUSTER_WORKERS) || 1,
  brokers: Number(argv.b) || Number(process.env.SOCKETCLUSTER_BROKERS) || 1,
  port: Number(argv.p) || Number(process.env.PORT),
  // You can switch to 'sc-uws' for improved performance.
  wsEngine: process.env.SOCKETCLUSTER_WS_ENGINE || 'ws',
  // host: process.env.SOCKETCLUSTER_HOST || '127.0.0.1',
  appName: argv.n || process.env.SOCKETCLUSTER_APP_NAME || null,
  workerController: workerControllerPath || path.join(__dirname, 'worker.js'),
  brokerController: brokerControllerPath || path.join(__dirname, 'broker.js'),
  workerClusterController: workerClusterControllerPath || null,
  socketChannelLimit: Number(process.env.SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT) || 1000,
  clusterStateServerHost: argv.cssh || process.env.SCC_STATE_SERVER_HOST || null,
  clusterStateServerPort: process.env.SCC_STATE_SERVER_PORT || null,
  clusterMappingEngine: process.env.SCC_MAPPING_ENGINE || null,
  clusterClientPoolSize: process.env.SCC_CLIENT_POOL_SIZE || null,
  clusterAuthKey: process.env.SCC_AUTH_KEY || null,
  clusterInstanceIp: process.env.SCC_INSTANCE_IP || null,
  clusterInstanceIpFamily: process.env.SCC_INSTANCE_IP_FAMILY || null,
  clusterStateServerConnectTimeout: Number(process.env.SCC_STATE_SERVER_CONNECT_TIMEOUT) || null,
  clusterStateServerAckTimeout: Number(process.env.SCC_STATE_SERVER_ACK_TIMEOUT) || null,
  clusterStateServerReconnectRandomness: Number(process.env.SCC_STATE_SERVER_RECONNECT_RANDOMNESS) || null,
  crashWorkerOnError: argv['auto-reboot'] !== false,
  // If using nodemon, set this to true, and make sure that environment is 'dev'.
  killMasterOnSignal: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV !== 'production' ? 'dev' : /* istanbul ignore next */ 'prod',
  protocol: process.env.SOCKETCLUSTER_PROTOCOL,
  // protocolOptions: process.env.SOCKETCLUSTER_PROTOCOL === 'https' ? {
  //   key: fs.readFileSync(`${__dirname}/privkey.pem`), // eslint-disable-line security/detect-non-literal-fs-filename
  //   cert: fs.readFileSync(`${__dirname}/fullchain.pem`), // eslint-disable-line security/detect-non-literal-fs-filename
  // } : null,
};

const bootTimeout = Number(process.env.SOCKETCLUSTER_CONTROLLER_BOOT_TIMEOUT) || 10000;
// let SOCKETCLUSTER_OPTIONS;
//
// if (process.env.SOCKETCLUSTER_OPTIONS) {
//   SOCKETCLUSTER_OPTIONS = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
// }
//
// for (const i in SOCKETCLUSTER_OPTIONS) { // eslint-disable-line no-restricted-syntax
//   if (SOCKETCLUSTER_OPTIONS.hasOwnProperty(i)) { // eslint-disable-line no-prototype-builtins
//     options[i] = SOCKETCLUSTER_OPTIONS[i];// eslint-disable-line security/detect-object-injection
//   }
// }

const start = () => {
  const socketCluster = new SocketCluster(options);
  /* istanbul ignore next */
  socketCluster.on(socketCluster.EVENT_WORKER_CLUSTER_START, (workerClusterInfo) => {
    debug('   >> WorkerCluster PID:', workerClusterInfo.pid);
    debug('   >> protocol:', options.protocol);
  });
  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'development') {
    // This will cause SC workers to reboot when code changes anywhere in the app directory.
    // The second options argument here is passed directly to chokidar.
    // See https://github.com/paulmillr/chokidar#api for details.
    debug(`   !! The sc-hot-reboot plugin is watching for code changes in the ${__dirname} directory`);
    scHotReboot.attach(socketCluster, {
      cwd: __dirname, // eslint-disable-next-line no-useless-escape
      ignored: ['public', 'node_modules', 'README.md', 'Dockerfile', 'server.js', 'broker.js', /[\/\\]\./, '*.log'],
    });
  }
};

const bootCheckInterval = Number(process.env.SOCKETCLUSTER_BOOT_CHECK_INTERVAL) || 200;
const bootStartTime = Date.now();

// Detect when Docker volumes are ready.
const startWhenFileIsReady = (filePath) => {
  const errorMessage = `Failed to locate a controller file at path ${filePath} `
  + 'before SOCKETCLUSTER_CONTROLLER_BOOT_TIMEOUT';
  return waitForFile(filePath, bootCheckInterval, bootStartTime, bootTimeout, errorMessage);
};

const filesReadyPromises = [
  startWhenFileIsReady(workerControllerPath),
  startWhenFileIsReady(brokerControllerPath),
  startWhenFileIsReady(workerClusterControllerPath),
];
Promise.all(filesReadyPromises)
  .then(() => { start(); })
  .catch(/* istanbul ignore next */(err) => {
    debug(err);
    throw err;
  });
