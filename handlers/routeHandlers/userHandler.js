// dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback)=> {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);

    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' &&
    requestProperties.body.firstName.trim().length > 0
    ? requestProperties.body.firstName
    : false;
    
    const lastName = typeof(requestProperties.body.lastName) === 'string' &&
    requestProperties.body.lastName.trim().length > 0
    ? requestProperties.body.lastName
    : false;

    const phone = typeof(requestProperties.body.phone) === 'string' &&
    requestProperties.body.phone.trim().length === 11
    ? requestProperties.body.phone
    : false;

    const passWord = typeof(requestProperties.body.passWord) === 'string' &&
    requestProperties.body.passWord.trim().length > 0
    ? requestProperties.body.passWord
    : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean'
    ? requestProperties.body.tosAgreement
    : false;

    if (firstName && lastName && phone && passWord && tosAgreement) {
        // make sure that user doesn't already exist
        data.read('users', phone, (err, user) => {
            if(err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    passWord: hash(passWord),
                    tosAgreement
                }
                // store the data to db
                data.create('users', phone, userObject, (err)=>{
                    if(!err) {
                        callback(200, {
                            message: 'User created successfully!'
                        });
                    } else {
                        callback(500, {
                            error: 'Could not create user!'
                        })
                    }
                })
            } else {
                callback(500, {
                    error : 'User already exist!'
                })
            }
        })
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        })
    }

}

handler._users.get = (requestProperties, callback) => {
    // check the phone no is valid
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
    ? requestProperties.queryStringObject.phone
    : false;

    if(phone) {
        // verify token
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if(tokenId) {
                // look up the user
                data.read('users', phone, (err, u) => {
                const user = {...parseJSON(u)}
                if(!err && user) {
                    delete user.passWord;
                    callback(200, user);
                } else {
                    callback(404, {
                        error: 'Requested user not found!'
                    });
                }
            })
            } else {
                callback(403, {
                    error: 'Authentication failure!'
                })
            }
        })
    } else {
        callback(404, {
            error: 'Requested user not found!'
        });
    }
}

handler._users.put = (requestProperties, callback) => {
    // check the phone no is valid
    const phone = typeof(requestProperties.body.phone) === 'string' &&
    requestProperties.body.phone.trim().length === 11
    ? requestProperties.body.phone
    : false;

    const firstName = typeof(requestProperties.body.firstName) === 'string' &&
    requestProperties.body.firstName.trim().length > 0
    ? requestProperties.body.firstName
    : false;
    
    const lastName = typeof(requestProperties.body.lastName) === 'string' &&
    requestProperties.body.lastName.trim().length > 0
    ? requestProperties.body.lastName
    : false;

    const passWord = typeof(requestProperties.body.passWord) === 'string' &&
    requestProperties.body.passWord.trim().length > 0
    ? requestProperties.body.passWord
    : false;

    if(phone) {
        if(firstName || lastName || passWord) {
            // verify token
            let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
            console.log('tokken',requestProperties.headersObject.token);

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if(tokenId) {
            // lookup the user
            data.read('users', phone, (err, uData) => {
                let userData = {...parseJSON(uData)}
                if(!err && userData) {

                    // setting new values
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(passWord) {
                        userData.passWord = hash(passWord);
                    }

                    // store updated data to db
                    data.update('users', phone, userData, (err) => {
                        if(!err) {
                            callback(200, {
                                message: 'User information updated successfully!'
                            })
                        } else {
                            callback(400, {
                                error: 'There was a error storing the updated data!'
                            });
                        }
                    })
                } else {
                    callback(404, {
                        error: 'The phone no does not belong to any user!'
                    })
                }
            })
                } else {
                    callback(403, {
                        error: 'Authentication failure!'
                    })
                }
            })
        } else {
            callback(400, {
                error: 'Bad request!'
            })
        }
    } else {
        callback(400, {
            error: 'Please, insert a valid phone number!'
        })
    }

}

handler._users.delete = (requestProperties, callback) => {
    // check the phone no is valid
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
    ? requestProperties.queryStringObject.phone
    : false;

    if(phone) {
        // verify token
        let token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if(tokenId) {
                // look up the user
                data.read('users', phone, (err, userData) => {
                    if(!err && userData) {
                        // delete user
                        data.delete('users', phone, (err) => {
                            if(!err) {
                                callback(200, {
                                    message: 'User deleted successfully!'
                                })
                            } else {
                                callback(500, {
                                    error: 'Server side error!'
                                })
                            }
                        })
                    } else {
                        callback(404, {
                            error: "Requested user does not exist!"
                        })
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!'
                })
            }
        })
    } else {
        callback(500, {
            error: 'There was a problem in your request!'
        })
    }
}

module.exports = handler;