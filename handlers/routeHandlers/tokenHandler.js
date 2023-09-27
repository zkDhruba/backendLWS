// dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback)=> {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);

    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof(requestProperties.body.phone) === 'string' &&
    requestProperties.body.phone.trim().length === 11
    ? requestProperties.body.phone
    : false;

    const passWord = typeof(requestProperties.body.passWord) === 'string' &&
    requestProperties.body.passWord.trim().length > 0
    ? requestProperties.body.passWord
    : false;

    if(phone && passWord) {
        //lookup corresponding user
        data.read('users', phone, (err, userData) => {
            let hashedPass = hash(passWord);
            if(hashedPass === parseJSON(userData).passWord) {
                let tokenId = createRandomString(40);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObj = {
                    phone,
                    'id': tokenId,
                    expires
                };

                //store the token
                data.create('tokens', tokenId, tokenObj, (err) => {
                    if (!err) {
                        callback(200, tokenObj);
                    } else {
                        callback(500, {
                            error: 'Server side error!'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Password invalid!'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Bad request!',
        })
    }
}

handler._token.get = (requestProperties, callback) => {
    // check the id is valid
    const id = typeof(requestProperties.queryStringObject.id) === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 40
    ? requestProperties.queryStringObject.id
    : false;

    if(id) {
        // look up the token
        data.read('tokens', id, (err, tokenData) => {
            const token = {...parseJSON(tokenData)}
            if(!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token not found!'
                });
            }
        })
    } else {
        callback(404, {
            error: 'Requested token not found!'
        });
    }
}

handler._token.put = (requestProperties, callback) => {
    const id = typeof(requestProperties.body.id) === 'string' &&
    requestProperties.body.id.trim().length === 40
    ? requestProperties.body.id
    : false;

    const extend = typeof(requestProperties.body.extend) === 'boolean' &&
    requestProperties.body.extend === true
    ? true
    : false;

    if (id && extend) {
        //lookup token
        data.read('tokens', id, (err, tokenData)=> {
            if(!err){
                let tokenObj = parseJSON(tokenData);
                if (tokenObj.expires > Date.now()) {
                    tokenObj.expires = Date.now() + 60 * 60 * 1000;
                    //store the updated token
                    data.update('tokens', id, tokenObj, (err)=>{
                        if(!err) {
                            callback(200, {
                                message: 'Expiry time extended!'
                            });
                        } else {
                            callback(500, {
                                error: 'Server error updating token!'
                            })
                        }
                    })
                } else {
                    callback(400, {
                        error: 'Token already expired!'
                    })
                }
            } else {
                callback(404, {
                    error: 'Requested token does not exist'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Bad request!'
        })
    }
}

handler._token.delete = (requestProperties, callback) => {
        // check the token is valid
        const id = typeof(requestProperties.queryStringObject.id) === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 40
        ? requestProperties.queryStringObject.id
        : false;

        if(id) {
            // lookup the token
            data.read('tokens', id, (err, tokenData) => {
                if(!err && tokenData) {
                    // delete user
                    data.delete('tokens', id, (err) => {
                        if(!err) {
                            callback(200, {
                                message: 'Token deleted successfully!'
                            })
                        } else {
                            callback(500, {
                                error: 'Server side error!'
                            })
                        }
                    })
                } else {
                    callback(404, {
                        error: "Token does not exist!"
                    })
                }
            });
        } else {
            callback(500, {
                error: 'There was a problem in your request!'
            })
        }
}

// token verify function
handler._token.verify = (id, phone, callback) => {
    //read token
    data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            // verification condition
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false)
        }
    })
}

module.exports = handler;