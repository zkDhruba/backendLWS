// dependencies
const { log } = require('console');
const http = require('http');
const {handlerReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');
const { sendTwilioSms } = require('./helpers/notifications');

// app object - module scaffolding
const app = {};

// @To-DO: remove later
sendTwilioSms('01770453756', 'Hello World!', (err) => {
    console.log('The error is:', err);
})

// testing update functionality
// data.delete('test', 'newFile2', (err)=>{
//     console.log(`Error was: ${err}`);
// });

// create server
app.createServer = ()=> {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    })
};

// handle req res
app.handleReqRes = handlerReqRes;

// start the server
app.createServer();