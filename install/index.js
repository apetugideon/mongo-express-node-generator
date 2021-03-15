const child_process = require("child_process");
const path = require('path');
const fs = require('fs');
const { readFileString, writeToFile } = require('../utils');
const dependencies = [
    "express", 
    "body-parser", 
    "cors",
    "mocha",
    "bcrypt",
    "chai",
    "chai-http",
    "dotenv",
    "jsonwebtoken",
    "mongoose",
    "mongoose-unique-validator",
    "multer",
    "nodemailer",
    "swagger-ui-express",
    "--save-dev nodemon",
    "--save-dev pluralize"
];


const writeRouteIndexFile = () => {
    writeToFile(
        `routes/index.js`, 
        readFileString(path.join(__dirname, 'routes-index.js'))
    );
}


const writeUtilitiesFile = () => {
    writeToFile(
        `utilities/index.js`, 
        readFileString(path.join(__dirname, 'utilities-index.js'))
    );
}


const writeIndexFile = () => {
    writeToFile(
        `api-doc/index.js`, 
        readFileString(path.join(__dirname, 'api-doc-index.js'))
    );
    writeToFile(
        `index.js`, 
        readFileString(path.join(__dirname, 'main-index.js'))
    );
    writeToFile(
        `.env`, 
        readFileString(path.join(__dirname, '.env'))
    );
    writeToFile(
        `middlewares/usersAuth.js`, 
        readFileString(path.join(__dirname, 'user-auth.js'))
    );
    writeToFile(
        `Makefile`, 
        readFileString(path.join(__dirname, 'Makefile'))
    );
}


const install = () => { 
    dependencies.forEach(async (item) => {
        await child_process.exec(`npm install ${item}`, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    });
    writeRouteIndexFile();
    writeUtilitiesFile();
    writeIndexFile();
}

module.exports.install = install;