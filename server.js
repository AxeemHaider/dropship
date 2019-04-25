const http = require('http');
const app = require('./app');

// Define the port number
const port = 8080; 

const server = http.createServer(app);

server.listen(port);