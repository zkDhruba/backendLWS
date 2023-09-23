// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback)=> {
    console.log(requestProperties);

    callback(404, {
        message: 'Requested URL not found'
    })
};

module.exports = handler;