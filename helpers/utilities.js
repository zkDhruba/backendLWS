// dependencies
const crypto = require('crypto');
const environment = require('../helpers/environments');

// scaffolding
const utilities = {};

// parse to JSON
utilities.parseJSON = (jsonString) => {
    let output = {};
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
}

// hash string
utilities.hash = (str) => {
    if(typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environment.secretKey).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

//create random string
utilities.createRandomString = (strLen) => {
    let length = strLen;
    length = typeof(strLen) === 'number' && strLen > 0 ? strLen : false;

    if(length) {
        const possibleChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let output = '';
        for (let i = 1; i<= length; i++) {
            const randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            output += randomChar;
        }
        return output;
    }
}

// export module
module.exports = utilities;