module.exports = {
  "{ routePath }": {
    "post": {
      "tags": ["{ routeTag }"],
      "summary": "{ appUrl }{ routePath }",
      "description": "Post { routeTag }",
      "operationId": "{ appUrl }{ routePath }",
      "parameters": [{
        "name": "Content-Type",
        "in": "header",
        "required": true,
        "style": "simple",
        "schema": {
          "type": "string",
          "example": "application/json"
        }
      }],
      "responses": {
        "200": {
          "description": "",
          "headers": {}
        }
      },
      "requestBody": {
        "description": "Post { routeTag }",
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "string",
              "example": {
                { exampleValue }
              }
            },
            "example": "{\n    { exampleValueString }\n}"
          }
        }
      }
    },
    "get": {
      "tags": ["{ routeTag }"],
      "summary": "{ appUrl }{ routePath }",
      "description": "List all { routeTag }",
      "operationId": "{ appUrl }{ routePath }3",
      "parameters": [{
        "name": "Content-Type",
        "in": "header",
        "required": true,
        "style": "simple",
        "schema": {
          "type": "string",
          "example": "application/json"
        }
      }],
      "responses": {
        "200": {
          "description": "",
          "headers": {}
        }
      }
    }
  },
  "{ routePath }/{id}": {
    "get": {
      "tags": ["{ routeTag }"],
      "summary": "{ appUrl }{ routePath }/{id}",
      "description": "Get { routeTag } by Id",
      "operationId": "{ appUrl }{ routePath }/{id}",
      "parameters": [{
        "name": "Content-Type",
        "in": "header",
        "required": true,
        "style": "simple",
        "schema": {
          "type": "string",
          "example": "application/json"
        }
      }],
      "responses": {
        "200": {
          "description": "",
          "headers": {}
        }
      }
    },
    "put": {
      "tags": ["{ routeTag }"],
      "summary": "{ appUrl }{ routePath }/{id}",
      "description": "Edit { routeTag }",
      "operationId": "{ appUrl }{ routePath }/{id}",
      "parameters": [
      {
        "name": "Content-Type",
        "in": "header",
        "required": true,
        "style": "simple",
        "schema": {
          "type": "string",
          "example": "application/json"
        }
      }],
      "responses": {
        "200": {
          "description": "",
          "headers": {}
        }
      },
      "requestBody": {
        "description": "Edit { routeTag }",
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "string",
              "example": {
                { exampleValue }
              }
            },
            "example": "{\n    { exampleValueString }\n}"
          }
        }
      }
    },
    "delete": {
      "tags": ["{ routeTag }"],
      "summary": "{ appUrl }{ routePath }/{id}",
      "description": "Delete { routeTag }",
      "operationId": "{ appUrl }{ routePath }/{id}",
      "parameters": [{
        "name": "Content-Type",
        "in": "header",
        "required": true,
        "style": "simple",
        "schema": {
          "type": "string",
          "example": "application/json"
        }
      }],
      "responses": {
        "200": {
          "description": "",
          "headers": {}
        }
      }
    }
  }
}