// dependencies


// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hgfjsahflkjjkfdgsk',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12512209503',
        accountSid: 'AC7135c45e8af7d0c18e0c56efee521ea5',
        authToken: 'a46ddfdea632ee96bd0c7946cf527ed5',
    }
}

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'dfsfhhjdsfiiofafdj',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12512209503',
        accountSid: 'AC7135c45e8af7d0c18e0c56efee521ea5',
        authToken: 'a46ddfdea632ee96bd0c7946cf527ed5',
    }
}

// deteremine which environment is passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// export responding environment object
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;