#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip_license_ramp_up_metric = exports.zip_calculate_correctness_metric = exports.getIssuesInZip = exports.license_ramp_up_metric = exports.calculate_correctness_metric = exports.findAllFiles = exports.calculate_ramp_up_metric = exports.countWords = exports.findGitHubRepoUrl = void 0;
const fs = __importStar(require("fs"));
const fse = __importStar(require("fs-extra"));
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const axios_1 = __importDefault(require("axios"));
const tmp = __importStar(require("tmp"));
const eslint_1 = require("eslint");
const path_1 = require("path");
const compatibleLicenses = [
    'mit license',
    'bsd 2-clause "simplified" license',
    /(mit.*license|license.*mit)/i,
]; //inherited
const licensesRegex = [
    /gpl/i,
    /gnu lesser general public license/i,
    /gnu general public license/i,
    /gnu affero public license/i,
    /gnu all-permissive license/i,
    /mit/i,
    /apache2/i,
    /apache 2/i,
    /apache-2/i,
    /apache license, version 2/i,
    /artistic/i,
    /bsd/i,
    /ldap/i,
    /cecill/i,
    /cryptix/i,
    /ecos/i,
    /ecl/i,
    /educational community license/i,
    /eiffel/i,
    /eu datagrid/i,
    /eudatagrid/i,
    /expat/i,
    /freetype/i,
    /hpnd/i,
    /historical permission notice and disclaimer/i,
    /imatrix/i,
    /imlib/i,
    /ijg/i,
    /independent jpeg/i,
    /informal license/i,
    /intel open source/i,
    /isc/,
    /mpl/i,
    /mozilla/i,
    /ncsa/i,
    /netscape/i,
    /perl/i,
    /python/i,
    /public domain/i,
    /license of ruby/i,
    /sgi free software/i,
    /ml of new jersey/i,
    /unicode/i,
    /upl/i,
    /universal permissive license/i,
    /unlicense/i,
    /vim/i,
    /w3c/i,
    /webm/i,
    /wtfpl/i,
    /wx/i,
    /x11/i,
    /xfree86/i,
    /zlib/i,
    /zope/i,
]; //team 10 phase 1
const concatLicense = compatibleLicenses.concat(licensesRegex);
async function cloneRepository(repoUrl, localPath) {
    try {
        // Clone the repository
        await isomorphic_git_1.default.clone({
            fs,
            http: node_1.default,
            dir: localPath,
            url: repoUrl,
        });
        //console.log('Repository cloned successfully.');
    }
    catch (error) {
        console.log({ 'level': 'error', 'message': `${error}` });
    }
}
async function findGitHubRepoUrl(packageName) {
    // console.log(`Finding GitHub repository URL for ${packageName}`)
    try {
        // Fetch package metadata from the npm registry
        // console.log(process.version)
        const response = await axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
        // console.log("got here")
        // console.log(response);
        // console.log(response.status);
        if (response.status !== 200) {
            console.log({ 'level': 'error', 'message': `Failed to fetch package metadata for ${packageName}` });
            return 'none';
        }
        // Parse the response JSON
        const packageMetadata = response.data;
        // console.log(packageMetadata);
        //console.log(packageMetadata.repository);
        //console.log(packageMetadata.repository.url);
        // Check if the "repository" field exists in the package.json
        if (packageMetadata.repository && packageMetadata.repository.url) {
            return 'https://' + packageMetadata.repository.url.match(/github\.com\/[^/]+\/[^/]+(?=\.git|$)/);
        }
        else {
            console.log({ 'level': 'error', 'message': `No repository URL found for ${packageName}` });
            return 'none';
        }
    }
    catch (error) {
        console.log({ 'level': 'error', 'message': `${error}` });
        return 'none';
    }
}
exports.findGitHubRepoUrl = findGitHubRepoUrl;
// Function to count words in a string
function countWords(text) {
    const words = text.split(/\s+/);
    const nonEmptyWords = words.filter(word => word !== '');
    return nonEmptyWords.length;
}
exports.countWords = countWords;
// Function to calculate the score based on word count
function calculate_ramp_up_metric(wordCount, maxWordCount) {
    const maxScore = 1.0; // Maximum score
    // Calculate the score based on the word count relative to the max word count
    return Math.min(wordCount / maxWordCount, maxScore);
}
exports.calculate_ramp_up_metric = calculate_ramp_up_metric;
function findAllFiles(directory) {
    const allFiles = [];
    const codeExtensions = ['.ts']; //NEED TP MAKE THIS WORK FOR ALL DIFFERENT TYPES OF FILES BUT RIGHT NOW IT ONLY GOES THROUGH .TS FILES
    function traverseDirectory(currentDir) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const filePath = (0, path_1.join)(currentDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                // Recursively traverse subdirectories
                traverseDirectory(filePath);
            }
            else if (codeExtensions.includes((0, path_1.extname)(filePath))) {
                allFiles.push(filePath);
            }
        }
    }
    traverseDirectory(directory);
    return allFiles;
}
exports.findAllFiles = findAllFiles;
async function calculate_correctness_metric(filepath) {
    try {
        // Initailize ESLint
        const eslint = new eslint_1.ESLint();
        //Get a list of Typescript files with the cloned directory
        const allFiles = findAllFiles(filepath);
        //Lint in Typescript files
        const results = eslint.lintFiles(allFiles);
        // Calculate the total number of issues (errors + warnings)
        let totalIssues = 0;
        for (const result of await results) {
            totalIssues += result.errorCount + result.warningCount;
        }
        // Calculate the lint score as a value between 0 and 1
        const lintScore = 1 - Math.min(1, totalIssues / 1000.0);
        return lintScore;
    }
    catch (error) {
        //console.error('Error running ESLint:', error);
        return 0; // Return 0 in case of an error
    }
}
exports.calculate_correctness_metric = calculate_correctness_metric;
async function license_ramp_up_metric(repoURL) {
    const tempDir = tmp.dirSync(); //makes a temporary directory
    const repoDir = tempDir.name;
    let license_met = 0;
    let ramp_up_met = 0;
    let correctness_met = 0;
    //looks into tmpdir to make a temporay directory and then deleting at the end of the function 
    //console.log(repoDir);
    fse.ensureDir(repoDir); //will make sure the directory exists or will create a new one
    //check the URL to see if it is a github url or a npmjs url 
    const url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
    const parts = url.split('/');
    if (parts[0] === 'npmjs.com') {
        //console.log("This is a npmjs url");
        //finds the github url of the npmjs module
        //console.log(`This is the npmjs package ${parts[2]}`);
        repoURL = await findGitHubRepoUrl(parts[2]);
        if (repoURL == null) {
            //console.log(`This npmjs is not stored in a github repository.`);
            return [license_met, ramp_up_met, correctness_met];
        }
    }
    //console.log(repoURL);
    //probably need to add in something to check if the url is from github just to make sure 
    await cloneRepository(repoURL, repoDir); //clones the repository
    //Reads in the cloned repository
    let readmePath = `${repoDir}/Readme.md`;
    let readmeContent = 'none';
    if (fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
    }
    else {
        readmePath = `${repoDir}/readme.markdown`;
        if (fs.existsSync(readmePath)) {
            readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
        }
    }
    //CALCULATES THE LICENSE SCORE 
    for (const compatibleLicense of compatibleLicenses) {
        if (readmeContent.match(compatibleLicense)) {
            license_met = 1; //License found was compatible 
        }
    }
    //CALCULATES THE RAMPUP SCORE 
    const wordCount = countWords(readmeContent); //gets the number of words in the README
    const maxWordCount = 2000; //NEED TO ADJUST THIS NUMBER BASED ON WHAT WE GET FROM DIFFERENT TEST RESULTS
    ramp_up_met = calculate_ramp_up_metric(wordCount, maxWordCount); //calculates the actual score
    //CALUCLATES THE CORRECTNESS SCORE
    correctness_met = await calculate_correctness_metric(repoDir);
    //deletes the temporary directory that was made
    try {
        fse.removeSync(repoDir);
        //console.log('Temporary directory deleted.');
    }
    catch (err) {
        console.log({ 'level': 'error', 'message': `${err}` });
    }
    return ([license_met, ramp_up_met, correctness_met]);
}
exports.license_ramp_up_metric = license_ramp_up_metric;
async function getIssuesInZip(zip) {
    const eslint = new eslint_1.ESLint();
    let totalIssues = 0;
    for (const [path, file] of Object.entries(zip.files)) {
        // console.log(file);
        if (file.dir) {
            continue;
        }
        if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
            // console.log('linting ts file ' + file.name)
            const content = await file.async('string');
            const filePath = file.name;
            try {
                const results = await eslint.lintText(content, { filePath });
                // console.log(results);
                totalIssues += results[0].errorCount + results[0].warningCount;
            }
            catch (error) {
                console.error(`Error linting ${filePath}:`, error);
            }
        }
    }
    return totalIssues;
}
exports.getIssuesInZip = getIssuesInZip;
async function zip_calculate_correctness_metric(loadedZip) {
    try {
        // Initailize ESLint
        // const eslint = new ESLint();
        // Get a list of Typescript files in the ZIP
        const totalIssues = await getIssuesInZip(loadedZip);
        const lintScore = 1 - Math.min(1, totalIssues / 1000.0);
        return lintScore;
    }
    catch (error) {
        console.error('Error running ESLint:', error);
        return 0; // Return 0 in case of an error
    }
}
exports.zip_calculate_correctness_metric = zip_calculate_correctness_metric;
// Takes in a JSZip and returns arr source-based metrics (license, ramp-up, correctness)
async function zip_license_ramp_up_metric(loadedZip) {
    let license_met = 0;
    let ramp_up_met = 0;
    let correctness_met = 0;
    // console.log('a');
    const readmeFiles = loadedZip.file(/readme\.md|readme\.markdown/i);
    if (!readmeFiles) {
        console.log({ 'level': 'error', 'message': `No README file found in the zip file.` });
        return [0, 0, 0];
    }
    var readmeFile = readmeFiles[0]; // weird to have multiple readmes but need to support for regex search
    // Read the contents of the readme file
    const readmeContent = (await readmeFile.async('text')).toLowerCase();
    // console.log(readmeContent);
    //CALCULATES THE LICENSE SCORE
    for (const compatibleLicense of concatLicense) {
        if (readmeContent.match(compatibleLicense)) {
            license_met = 1; //License found was compatible 
            break; // no need to continue searching
        }
    }
    //CALCULATES THE RAMPUP SCORE 
    const wordCount = countWords(readmeContent); //gets the number of words in the README
    const maxWordCount = 2000; //NEED TO ADJUST THIS NUMBER BASED ON WHAT WE GET FROM DIFFERENT TEST RESULTS
    ramp_up_met = calculate_ramp_up_metric(wordCount, maxWordCount);
    //CALUCLATES THE CORRECTNESS SCORE
    correctness_met = await zip_calculate_correctness_metric(loadedZip);
    console.log([license_met, ramp_up_met, correctness_met]);
    return ([license_met, ramp_up_met, correctness_met]);
}
exports.zip_license_ramp_up_metric = zip_license_ramp_up_metric;
