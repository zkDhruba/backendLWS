// dependencies
const {sampleHandler} = require('./handlers/routeHandlers/sampleHandler')
const {userHandler} = require('./handlers/routeHandlers/userHandler')

// module scaffolding
const routes = {
    'sample': sampleHandler,
    'user': userHandler,
};

module.exports = routes;