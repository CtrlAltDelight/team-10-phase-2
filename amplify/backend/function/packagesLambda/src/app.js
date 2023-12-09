"use strict";
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
const tableName = 'PackagesTable-staging';
const s3BucketName = 't10-v3-packages22058-staging';
// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
// Enable CORS for all methods
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.use(express.json()); // Middleware to parse JSON bodies
// POST /packages - Get the packages from the registry
app.post('/packages', async (req, res) => {
    // Extract offset from header
    let offset = req.header('offset');
    if (!offset) {
        offset = 1;
    }
    const pkgQuery = req.body;
    console.log('pkgQuery= ', pkgQuery);
    // Logic for handling PackageQuery
    let searchResults;
    try {
        if (pkgQuery[0].name === '*') {
            //Get all the packages
            searchResults = await getAllPackages(offset);
        }
        else {
            // Get the packages that match the query
            searchResults = await getPackages(pkgQuery);
        }
        if (!searchResults) {
            res.status(404).json({ message: 'No package found under this query.' });
            return;
        }
        res.status(200).json(searchResults);
        return;
    }
    catch (err) {
        res.status(500).json({ message: 'Error querying DynamoDB' });
        return;
    }
});
async function getAllPackages(offset) {
    const params = {
        TableName: tableName,
    };
    try {
        const data = await dynamodb.scan(params).promise();
        console.log(data);
        if (data.Items.length == 0) {
            return;
        }
        const searchResults = [];
        for (let i = offset; i < data.Items.length; i++) {
            searchResults.push(data.Items[i]);
        }
        return searchResults;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
async function getPackages(pkgQuery) {
    const params = {
        TableName: tableName,
    };
    try {
        const data = await dynamodb.scan(params).promise();
        console.log(data);
        if (data.Items.length == 0) {
            return;
        }
        const searchResults = [];
        for (let i = 0; i < data.Items.length; i++) {
            const item = data.Items[i];
            if (pkgQuery[0].name === item.Name && pkgQuery[0].version === item.Version) {
                searchResults.push(item);
            }
        }
        return searchResults;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
// DELETE /reset - Reset the registry
app.delete('/reset', async (req, res) => {
    // Logic for handling RegistryReset
    try {
        await resetS3Bucket();
        await resetDynamoDB();
        res.status(200).json({ message: 'Registry is reset' });
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error resetting S3 bucket or DynamoDB' });
        return;
    }
});
async function resetDynamoDB() {
    const params = {
        TableName: tableName,
    };
    try {
        const data = await dynamodb.scan(params).promise();
        console.log(data);
        if (data.Items.length == 0) {
            return;
        }
        const deleteParams = {
            RequestItems: {}
        };
        deleteParams.RequestItems[tableName] = [];
        data.Items.forEach((item) => {
            deleteParams.RequestItems[tableName].push({ DeleteRequest: { Key: { 'PackageID': item.PackageID } } });
        });
        await dynamodb.batchWrite(deleteParams).promise();
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
async function resetS3Bucket() {
    const params = {
        Bucket: s3BucketName,
    };
    try {
        const data = await s3.listObjects(params).promise();
        console.log(data);
        if (data.Contents.length == 0) {
            return;
        }
        const deleteParams = {
            Bucket: s3BucketName,
            Delete: { Objects: [] }
        };
        data.Contents.forEach((content) => {
            deleteParams.Delete.Objects.push({ Key: content.Key });
        });
        await s3.deleteObjects(deleteParams).promise();
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
// GET /package/{id} - Interact with the package with this ID
app.get('/package/:id', (req, res) => {
    // Logic for handling PackageRetrieve
    const id = req.params.id;
    // Get the package from DynamoDB
    const params = {
        TableName: tableName,
        Key: {
            'PackageID': id,
        }
    };
    dynamodb.get(params, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error retrieving package from DynamoDB' });
            return;
        }
        else {
            console.log(data);
            if (data.Item) {
                const s3Key = `${data.Item.Name}-${data.Item.Version}.zip`;
                const s3Params = {
                    Bucket: s3BucketName,
                    Key: s3Key,
                };
                // Get the package from S3
                s3.getObject(s3Params, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ message: 'Error retrieving package from S3' });
                        return;
                    }
                    else {
                        console.log(data);
                        const body = Buffer.from(data.Body, 'base64');
                        const responseJson = { 'metadata': { 'Name': data.Item.Name, 'Version': data.Item.Version, 'ID': data.Item.PackageID },
                            'data': { 'content': body } };
                        if (data.Item.URL) {
                            responseJson.metadata.URL = data.Item.URL;
                        }
                        res.status(200).json(responseJson);
                        return;
                    }
                });
            }
            else {
                res.status(404).json({ message: 'Package does not exist' });
                return;
            }
        }
    });
});
// PUT /package/{id} - Update the content of the package
app.put('/package/:id', (req, res) => {
    // Logic for handling PackageUpdate
    const id = req.params.id;
    const body = req.body;
    const { Name, Version, ID } = body.metadata;
    const { URL, Content } = body.data;
    if ((!URL && !Content) || (URL && Content)) {
        res.status(400).json({ message: 'There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.' });
        return;
    }
    if (id !== ID) {
        res.status(400).json({ message: 'There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.' });
        return;
    }
    const packageId = `${Name}-${Version}.zip`;
    // Update the package in DynamoDB
    const params = {
        TableName: tableName,
        Key: {
            'PackageID': packageId,
        }
    };
    dynamodb.get(params, async (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error retrieving package from DynamoDB' });
            return;
        }
        else {
            console.log(data);
            if (data.Item) {
                const s3Key = `${data.Item.Name}-${data.Item.Version}.zip`;
                const s3Params = {
                    Bucket: s3BucketName,
                    Key: s3Key,
                };
                // Update the package in dynamoDB and s3
                if (URL) {
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
                        catch (_a) {
                            console.log(error);
                            res.status(500).json({ message: 'Error downloading from URL' });
                            return;
                        }
                    }
                    if (response) {
                        const body = Buffer.from(response.data, 'binary');
                    }
                    const base64Body = body.toString('base64');
                    const updateParams = {
                        TableName: tableName,
                        Key: {
                            'PackageID': packageId,
                        },
                        UpdateExpression: 'set URL = :u',
                        ExpressionAttributeValues: {
                            ':u': URL,
                        },
                        ReturnValues: 'UPDATED_NEW',
                    };
                    dynamodb.update(updateParams, (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Error updating package in DynamoDB' });
                            return;
                        }
                        else {
                            console.log(data);
                            res.status(200).json({ message: 'Package is updated' });
                        }
                    });
                    // Update S3 with the new content
                    const s3Params = {
                        Bucket: s3BucketName,
                        Key: s3Key,
                        Body: base64Body
                    };
                    // Upload the file to S3
                    s3.putObject(s3Params, (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Error uploading package to S3' });
                            return;
                        }
                        else {
                            console.log(data);
                            res.status(200).json({ message: 'Version is updated.' });
                            return;
                        }
                    });
                }
                else {
                    const content = body.toString('base64');
                    const s3Params = {
                        Bucket: s3BucketName,
                        Key: s3Key,
                        Body: content
                    };
                    // Upload the file to S3
                    s3.putObject(s3Params, (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Error uploading package to S3' });
                            return;
                        }
                        else {
                            console.log(data);
                            res.status(200).json({ message: 'Version is updated.' });
                            return;
                        }
                    });
                }
            }
            else {
                res.status(404).json({ message: 'Package does not exist' });
                return;
            }
        }
    });
});
// DELETE /package/{id} - Delete this version of the package
app.delete('/package/:id', (req, res) => {
    // Logic for handling PackageDelete
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ message: 'There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.' });
        return;
    }
    // Delete package from s3 and dynamoDB of this id
    const params = {
        TableName: tableName,
        Key: {
            'PackageID': id,
        }
    };
    dynamodb.get(params, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error retrieving package from DynamoDB' });
            return;
        }
        else {
            console.log(data);
            if (data.Item) {
                const s3Key = `${data.Item.Name}-${data.Item.Version}.zip`;
                const s3Params = {
                    Bucket: s3BucketName,
                    Key: s3Key,
                };
                // Delete the package from S3
                s3.deleteObject(s3Params, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ message: 'Error deleting package from S3' });
                        return;
                    }
                    else {
                        console.log(data);
                        // Delete the package from DynamoDB
                        dynamodb.delete(params, (err, data) => {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: 'Error deleting package from DynamoDB' });
                                return;
                            }
                            else {
                                console.log(data);
                                res.status(200).json({ message: 'Package is deleted' });
                                return;
                            }
                        });
                    }
                });
            }
            else {
                res.status(404).json({ message: 'Package does not exist' });
                return;
            }
        }
    });
});
async function getZipFromURL(URL) {
}
// POST /package - Upload or Ingest a new package
app.post('/package', async (req, res) => {
    // Logic for handling PackageCreate
    console.log('REQUEST');
    // console.log(req);
    console.log('REQUEST BODY');
    console.log(req.body);
    console.log('Type of req body');
    console.log(typeof req.body);
    const { URL, Content } = req.body;
    if ((!URL && !Content) || (URL && Content)) {
        res.status(400).json({ message: 'There is missing field(s) in the PackageData/AuthenticationToken \
                                          or it is formed improperly (e.g. Content and URL are both set), or\
                                           the AuthenticationToken is invalid.' });
        return;
    }
    if (URL) {
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
            catch (_a) {
                console.log(error);
                res.status(500).json({ message: 'Error downloading from URL' });
                return;
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
                return;
            }
            console.log(packageJSON);
            const parsedPackageJSON = JSON.parse(packageJSON);
            console.log(parsedPackageJSON);
            const packageName = parsedPackageJSON.name;
            console.log(packageName);
            const packageVersion = parsedPackageJSON.version;
            console.log(packageVersion);
            const s3Key = `${packageName}-${packageVersion}.zip`;
            // Convert body to base64 encoded string
            const content = body.toString('base64');
            const params = {
                Bucket: s3BucketName,
                Key: s3Key,
                Body: content
            };
            // Check if the object already exists in S3
            try {
                await s3.headObject({ Bucket: params.Bucket, Key: params.Key }).promise();
                console.log('File already exists in S3');
                res.status(409).json({ message: 'Package exists already' });
                return;
            }
            catch (err) { // If the object does not exist in S3, upload it
                try {
                    // Upload the file to S3
                    await s3.putObject(params).promise();
                    // Upload Name, Version, and ID to DynamoDB
                    const packageParams = {
                        TableName: tableName,
                        Item: {
                            'PackageID': s3Key,
                            'Name': packageName,
                            'Version': packageVersion,
                            'URL': URL,
                            'Score': 0,
                        }
                    };
                    await dynamodb.put(packageParams).promise();
                    console.log('File uploaded successfully.');
                    res.status(200).json({ 'metadata': { 'Name': packageName, 'Version': packageVersion, 'ID': s3Key },
                        'data': { 'content': body } });
                    return;
                }
                catch (err) {
                    console.error('Error uploading file:', err);
                    res.status(500).json({ message: 'Error uploading to S3 or dynamoDB' });
                    return;
                }
            }
        }
    }
    else {
        // If URL is not set, create a new Package object in DynamoDB with the content
        // Then, return the PackageID
        // Extract the package name and version from the package.json file
        // Content is a base64 encoded string
        const body = Buffer.from(Content, 'base64');
        console.log('BODY');
        console.log(body);
        console.log('FINDING PACKAGE JSON');
        const packageJSON = await findPackageJSON(body);
        if (!packageJSON) {
            res.status(500).json({ message: 'Error finding package.json in zip file' });
            return;
        }
        console.log(packageJSON);
        const parsedPackageJSON = JSON.parse(packageJSON);
        console.log(parsedPackageJSON);
        const packageName = parsedPackageJSON.name;
        console.log(packageName);
        const packageVersion = parsedPackageJSON.version;
        console.log(packageVersion);
        const packageURL = parsedPackageJSON.repository.url;
        const s3Key = `${packageName}-${packageVersion}.zip`;
        const params = {
            Bucket: s3BucketName,
            Key: s3Key,
            Body: Content,
            URL: packageURL,
        };
        // Check if the object already exists in S3
        try {
            await s3.headObject({ Bucket: params.Bucket, Key: params.Key }).promise();
            console.log('File already exists in S3');
            res.status(409).json({ message: 'Package exists already' });
            return;
        }
        catch (err) { // If the object does not exist in S3, upload it
            try {
                // Upload the file to S3
                await s3.putObject(params).promise();
                // Upload Name, Version, and ID to DynamoDB
                const packageParams = {
                    TableName: tableName,
                    Item: {
                        'PackageID': s3Key,
                        'Name': packageName,
                        'Version': packageVersion,
                        'Score': 0,
                    }
                };
                await dynamodb.put(packageParams).promise();
                console.log('File uploaded successfully.');
                res.status(200).json({ 'metadata': { 'Name': packageName, 'Version': packageVersion, 'ID': s3Key },
                    'data': { 'content': body } });
                return;
            }
            catch (err) {
                console.error('Error uploading file:', err);
                res.status(500).json({ message: 'Error uploading to S3 or dynamoDB' });
                return;
            }
        }
    }
});
// Helper function to find the package.json file in the zip file
async function findPackageJSON(body) {
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
app.post('/package/byRegEx', (req, res) => {
    // Logic for handling PackageByRegExGet
    const body = req.body;
    const regex = body.RegEx;
    if (!regex) {
        res.status(400).json({ message: 'There is missing field(s) in the PackageRegEx/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.' });
        return;
    }
    // Search Packages in DynamoDB by input regular expression
    const params = {
        TableName: tableName,
    };
    dynamodb.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error retrieving packages from DynamoDB' });
            return;
        }
        else {
            console.log(data);
            if (data.Items.length == 0) {
                res.status(404).json({ message: 'No package found under this regex.' });
                return;
            }
            else {
                const searchResults = [];
                for (let i = 0; i < data.Items.length; i++) {
                    const item = data.Items[i];
                    if (item.Name.match(regex)) {
                        searchResults.push({ 'Version': item.Version, 'Name': item.Name });
                    }
                }
                res.status(200).json(searchResults);
                return;
            }
        }
    });
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
module.exports = app;
