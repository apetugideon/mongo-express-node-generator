var fs = require('fs');

const docParams = () => {
  let docTemplates = {}, bearerArray = [];
  let docFiles = fs.readdirSync(__dirname);
  docFiles.forEach(item => {
      let [inp, fname, ext] = /(\w+).(\w+)$/.exec(item);
      if(fname !== "index" && ext === "js") {
        let currentTemplate = require(`./${item}`);
        let templateKeys = Object.keys(currentTemplate);
        let templateValues = Object.values(currentTemplate);
        templateKeys.forEach((index, pos) => {
          docTemplates[index] = templateValues[pos];
        })
        bearerArray.push({"bearer": []})
      }
  });
  return { docTemplates, bearerArray }
}

module.exports.apiDocTemplate = async() => {
  const { docTemplates, bearerArray } = await docParams();
  return {
    "openapi": "3.0.0",
    "servers": [
      {
        "url": "http://localhost:5000",
        "description": "",
        "variables": {}
      }
    ],
    "info": {
      "version": "1.0",
      "title": "App Desc",
      "description": "APIs documentation",
      "termsOfService": "",
      "contact": {},
      "license": {
        "name": ""
      }
    },
    "paths": docTemplates,
    "components": {
      "parameters": {
        "Content-Type": {
          "name": "Content-Type",
          "in": "header",
          "required": true,
          "style": "simple",
          "schema": {
            "type": "string",
            "example": "application/json"
          }
        }
      },
      "securitySchemes": {
        "bearer": {
          "type": "http",
          "scheme": "bearer"
        }
      }
    },
    "security": bearerArray,
    "tags": [],
    "externalDocs": {
      "url": "",
      "description": ""
    },
    "warnings": []
  }
}