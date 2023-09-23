// dependencies
const { log } = require('console');
const http = require('http');
const {handlerReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');

// app object - module scaffolding
const app = {};

// create server
app.createServer = ()=> {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, ()=>{
        console.log(`listening to port ${environment.port}`);
    })
}

// handle req res
app.handleReqRes = handlerReqRes;

// start the server
app.createServer();