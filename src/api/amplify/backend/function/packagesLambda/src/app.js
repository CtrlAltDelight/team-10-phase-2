/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
const AWS = require('aws-sdk');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const bodyParser = require('body-parser');
const express = require('express');

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = 'PackagesTable';
if (process.env.ENV && process.env.ENV !== 'NONE') {
  tableName = tableName + '-' + process.env.ENV;
}

// const userIdPresent = false; // TODO: update in case is required to use that definition
// const partitionKeyName = 'PackageID';
// const partitionKeyType = 'S';
// const sortKeyName = '';
// const sortKeyType = '';
// const hasSortKey = sortKeyName !== '';
// const path = '/package/:id';
// const UNAUTH = 'UNAUTH';
// const hashKeyPath = '/:' + partitionKeyName;
// const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// convert url string param to expected Type
// const convertUrlType = (param, type) => {
//   switch(type) {
//     case 'N':
//       return Number.parseInt(param);
//     default:
//       return param;
//   }
// };

app.use(express.json()); // Middleware to parse JSON bodies

// POST /packages - Get the packages from the registry
app.post('/packages', (req, res) => {
    // Logic for handling PackagesList
    let response = {
        statusCode: 400,
        body: JSON.stringify({ message: 'you made it' })
    };

    return response;
});

// DELETE /reset - Reset the registry
app.delete('/reset', (req, res) => {
    // Logic for handling RegistryReset
});

// GET /package/{id} - Interact with the package with this ID
app.get('/package/:id', (req, res) => {
    // Logic for handling PackageRetrieve
});

// PUT /package/{id} - Update the content of the package
app.put('/package/:id', (req, res) => {
    // Logic for handling PackageUpdate
});

// DELETE /package/{id} - Delete this version of the package
app.delete('/package/:id', (req, res) => {
    // Logic for handling PackageDelete
});

// POST /package - Upload or Ingest a new package
app.post('/package', (req, res) => {
    // Logic for handling PackageCreate
});

// GET /package/{id}/rate - Get ratings for this package
app.get('/package/:id/rate', (req, res) => {
    // Logic for handling PackageRate
});

// PUT /authenticate - Create an access token
app.put('/authenticate', (req, res) => {
    // Logic for handling CreateAuthToken
});

// GET /package/byName/{name} - Return the history of this package
app.get('/package/byName/:name', (req, res) => {
    // Logic for handling PackageByNameGet
});

// DELETE /package/byName/{name} - Delete all versions of this package
app.delete('/package/byName/:name', (req, res) => {
    // Logic for handling PackageByNameDelete
});

// POST /package/byRegEx - Get any packages fitting the regular expression
app.post('/package/byRegEx', (req, res) => {
    // Logic for handling PackageByRegExGet
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

// Additional helper functions or logic

// /********************************
//  * HTTP Get method for list objects *
//  ********************************/

// app.get(path + hashKeyPath, function(req, res) 
//   const condition = {};
//   condition[partitionKeyName] = {
//     ComparisonOperator: 'EQ'
//   };

//   if (userIdPresent && req.apiGateway) {
//     condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
//   } else {
//     try {
//       condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }

//   let queryParams = {
//     TableName: tableName,
//     KeyConditions: condition
//   };

//   dynamodb.query(queryParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: 'Could not load items: ' + err});
//     } else {
//       res.json(data.Items);
//     }
//   });
// });

// /*****************************************
//  * HTTP Get method for get single object *
//  *****************************************/

// app.get(path + '/object' + hashKeyPath + sortKeyPath, function(req, res) {
//   const params = {};
//   if (userIdPresent && req.apiGateway) {
//     params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   } else {
//     params[partitionKeyName] = req.params[partitionKeyName];
//     try {
//       params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//   if (hasSortKey) {
//     try {
//       params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }

//   let getItemParams = {
//     TableName: tableName,
//     Key: params
//   };

//   dynamodb.get(getItemParams,(err, data) => {
//     if(err) {
//       res.statusCode = 500;
//       res.json({error: 'Could not load items: ' + err.message});
//     } else {
//       if (data.Item) {
//         res.json(data.Item);
//       } else {
//         res.json(data) ;
//       }
//     }
//   });
// });


// /************************************
// * HTTP put method for insert object *
// *************************************/

// app.put(path, function(req, res) {

//   if (userIdPresent) {
//     req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   }

//   let putItemParams = {
//     TableName: tableName,
//     Item: req.body
//   };
//   dynamodb.put(putItemParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({ error: err, url: req.url, body: req.body });
//     } else{
//       res.json({ success: 'put call succeed!', url: req.url, data: data });
//     }
//   });
// });

// /************************************
// * HTTP post method for insert object *
// *************************************/

// app.post(path, function(req, res) {

//   if (userIdPresent) {
//     req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   }

//   let putItemParams = {
//     TableName: tableName,
//     Item: req.body
//   };
//   dynamodb.put(putItemParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: err, url: req.url, body: req.body});
//     } else {
//       res.json({success: 'post call succeed!', url: req.url, data: data});
//     }
//   });
// });

// /**************************************
// * HTTP remove method to delete object *
// ***************************************/

// app.delete(path + '/object' + hashKeyPath + sortKeyPath, function(req, res) {
//   const params = {};
//   if (userIdPresent && req.apiGateway) {
//     params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   } else {
//     params[partitionKeyName] = req.params[partitionKeyName];
//      try {
//       params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//   if (hasSortKey) {
//     try {
//       params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }

//   let removeItemParams = {
//     TableName: tableName,
//     Key: params
//   };
//   dynamodb.delete(removeItemParams, (err, data)=> {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: err, url: req.url});
//     } else {
//       res.json({url: req.url, data: data});
//     }
//   });
// });

// app.listen(3000, function() {
//   console.log('App started');
// });

// // Export the app object. When executing the application local this does nothing. However,
// // to port it to AWS Lambda we will create a wrapper around that will load the app from
// // this file