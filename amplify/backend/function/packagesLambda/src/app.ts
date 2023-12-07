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
const axios = require('axios');
const JSZip = require('jszip');


AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

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
app.use(function(req: any, res: any, next: any) {
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
app.post('/packages', (req: any, res: any) => {
    res.status(200).json({ message: 'you made it' });
});

// DELETE /reset - Reset the registry
app.delete('/reset', (req: any, res: any) => {
    // Logic for handling RegistryReset
});

// GET /package/{id} - Interact with the package with this ID
app.get('/package/:id', (req: any, res:any) => {
    // Logic for handling PackageRetrieve
});

// PUT /package/{id} - Update the content of the package
// app.put('/package/:id', (req, res) => {
//     // Logic for handling PackageUpdate
// });

// DELETE /package/{id} - Delete this version of the package
// app.delete('/package/:id', (req, res) => {
//     // Logic for handling PackageDelete
// });

// POST /package - Upload or Ingest a new package
app.post('/package', async (req: any, res: any) => {
    // Logic for handling PackageCreate
    console.log('REQUEST');
    // console.log(req);
    console.log('REQUEST BODY');
    console.log(req.body);
    console.log('Type of req body');
    console.log(typeof req.body);
    const {URL, content} = req.body;
    if ((!URL && !content) || (URL && content)) {
        res.status(400).json({ message: 'There is missing field(s) in the PackageData/AuthenticationToken \
                                          or it is formed improperly (e.g. Content and URL are both set), or\
                                           the AuthenticationToken is invalid.' });
    }

    if(URL) {
        // If URL is set, download the file from the URL and store it in S3
        // Then, create a new Package object in DynamoDB with the S3 URL
        // Then, return the PackageID
        const zipUrl = `${URL}/archive/main.zip`;
        let response = null;
        console.log('RESPONSE');
        try {
          response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
          // console.log(response);
        }
        catch (error) {
          try {
            const newZipUrl = `${URL}/archive/master.zip`;
            response = await axios.get(newZipUrl, { responseType: 'arraybuffer' });
            // console.log(response);
          }
          catch {
            console.log(error);
            res.status(500).json({ message: 'Error downloading from URL' });
          }
        }

        if (response) {
          const body = Buffer.from(response.data, 'binary');
          console.log('BODY');
          console.log(body);

          console.log('FINDING PACKAGE JSON');
          const packageJSON = await findPackageJSON(body);
          if (!packageJSON) {
            res.status(500).json({ message: 'Error finding package.json in zip file' });
          }
          console.log(packageJSON);
          const parsedPackageJSON = JSON.parse(packageJSON);
          console.log(parsedPackageJSON);
          const packageName = parsedPackageJSON.name;
          console.log(packageName);
          const packageVersion = parsedPackageJSON.version;
          console.log(packageVersion);

          const s3Key = `${packageName}/${packageVersion}.zip`;

          const params = {
              Bucket: 'amplify-t10v3-staging-22058-deployment',
              Key: s3Key,
              Body: body
          };

          s3.upload(params, (err: any, data: any) => {
              if (err) {
                  console.log(err);
                  res.status(500).json({ message: 'Error uploading to S3' });
              }
              else {
                  console.log(data);
                  res.status(200).json({ 'metadata': { 'Name': packageName, 'Version': packageVersion, 'ID': data.Key },
                                        'data': {'content': body} });
              }
          }
          );

      }
    }
    else {
        // If URL is not set, create a new Package object in DynamoDB with the content
        // Then, return the PackageID
    }
});

// Helper function to find the package.json file in the zip file
async function findPackageJSON(body: Buffer) {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(body);
    
    for (const relativePath in loadedZip.files) {
        console.log('relativePath=', relativePath);
        const pathParts = relativePath.split('/');
        console.log('pathParts[1]=', pathParts[1]);

        if (pathParts.length == 2 && pathParts[1] === 'package.json') {
            console.log('I GOT HERE');
            const packageInfo = await loadedZip.file(relativePath).async('text');
            console.log('packageInfo');
            console.log(packageInfo);
            return packageInfo;
        }
    }

    throw new Error('package.json not found');
}


// GET /package/{id}/rate - Get ratings for this package
// app.get('/package/:id/rate', (req, res) => {
//     // Logic for handling PackageRate
// });

// PUT /authenticate - Create an access token
// app.put('/authenticate', (req, res) => {
//     // Logic for handling CreateAuthToken
// });

// GET /package/byName/{name} - Return the history of this package
// app.get('/package/byName/:name', (req, res) => {
//     // Logic for handling PackageByNameGet
// });

// DELETE /package/byName/{name} - Delete all versions of this package
// app.delete('/package/byName/:name', (req, res) => {
//     // Logic for handling PackageByNameDelete
// });

// POST /package/byRegEx - Get any packages fitting the regular expression
// app.post('/package/byRegEx', (req, res) => {
//     // Logic for handling PackageByRegExGet
// });

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;