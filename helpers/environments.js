// dependencies


// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hgfjsahflkjjkfdgsk'
}

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'dfsfhhjdsfiiofafdj'
}

// deteremine which environment is passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// export responding environment object
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;