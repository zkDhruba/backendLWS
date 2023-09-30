// dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { token } = require('../../routes');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback)=> {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._checks[requestProperties.method](requestProperties, callback);

    } else {
        callback(405);
    }
};

handler._checks = {};

handler._checks.post = (requestProperties, callback) => {
    //validate inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
    ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' &&  requestProperties.body.url.trim().length > 0
    ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
    ? requestProperties.body.method : false;

    let successCode = typeof(requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array
    ? requestProperties.body.successCode : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds >= 1
    && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (protocol && url && method && successCode && timeoutSeconds) {
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        //lookup the corresponding user phone by token
        data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                //lookup the user data
                data.read('users', userPhone, (err, userData) => {
                    if(!err && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if(tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array
                                ? userObject.checks : [];
                                if (userChecks.length < maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObj = {
                                        'id': checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeoutSeconds
                                    };
                                    // save the check object
                                    data.create('checks', checkId, checkObj, (err)=> {
                                        if(!err) {
                                            // add check id to the userObject
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err) => {
                                                if(!err) {
                                                    callback(200, userObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a server side error!'
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(500, {
                                                error: 'There was a server side error!'
                                            });
                                        }
                                    })
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication problem!'
                                })
                            }
                        })
                    } else {
                        callback(404, {
                            error: 'User not found!'
                        })
                    }
                })
            } else {
                callback(403, {
                    error: 'Authentication problem!'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Bad request!'
        })
    }
}

handler._checks.get = (requestProperties, callback) => {

}

handler._checks.put = (requestProperties, callback) => {

}

handler._checks.delete = (requestProperties, callback) => {

}

module.exports = handler;