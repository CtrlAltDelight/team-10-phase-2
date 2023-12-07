#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.license_ramp_up_metric = exports.calculate_correctness_metric = exports.findAllFiles = exports.calculate_ramp_up_metric = exports.countWords = exports.findGitHubRepoUrl = void 0;
const run_1 = require("./run");
const fs = require("fs");
const fse = require("fs-extra");
const isomorphic_git_1 = require("isomorphic-git");
const node_1 = require("isomorphic-git/http/node");
const axios_1 = require("axios");
const tmp = require("tmp");
const eslint_1 = require("eslint");
const path_1 = require("path");
const compatibleLicenses = [
    'mit license',
    'bsd 2-clause "simplified" license',
    /(mit.*license|license.*mit)/i,
];
function cloneRepository(repoUrl, localPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clone the repository
            yield isomorphic_git_1.default.clone({
                fs,
                http: node_1.default,
                dir: localPath,
                url: repoUrl,
            });
            //console.log('Repository cloned successfully.');
        }
        catch (error) {
            run_1.default.log({ 'level': 'error', 'message': `${error}` });
        }
    });
}
function findGitHubRepoUrl(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch package metadata from the npm registry
            const response = yield axios_1.default.get(`https://registry.npmjs.org/${packageName}`);
            if (response.status !== 200) {
                run_1.default.log({ 'level': 'error', 'message': `Failed to fetch package metadata for ${packageName}` });
                return 'none';
            }
            // Parse the response JSON
            const packageMetadata = response.data;
            //console.log(packageMetadata.repository);
            //console.log(packageMetadata.repository.url);
            // Check if the "repository" field exists in the package.json
            if (packageMetadata.repository && packageMetadata.repository.url) {
                return 'https://' + packageMetadata.repository.url.match(/github\.com\/[^/]+\/[^/]+(?=\.git|$)/);
            }
            else {
                run_1.default.log({ 'level': 'error', 'message': `No repository URL found for ${packageName}` });
                return 'none';
            }
        }
        catch (error) {
            run_1.default.log({ 'level': 'error', 'message': `${error}` });
            return 'none';
        }
    });
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
function calculate_correctness_metric(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initailize ESLint
            const eslint = new eslint_1.ESLint();
            //Get a list of Typescript files with the cloned directory
            const allFiles = findAllFiles(filepath);
            //Lint in Typescript files
            const results = eslint.lintFiles(allFiles);
            // Calculate the total number of issues (errors + warnings)
            let totalIssues = 0;
            for (const result of yield results) {
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
    });
}
exports.calculate_correctness_metric = calculate_correctness_metric;
function license_ramp_up_metric(repoURL) {
    return __awaiter(this, void 0, void 0, function* () {
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
            repoURL = yield findGitHubRepoUrl(parts[2]);
            if (repoURL == null) {
                //console.log(`This npmjs is not stored in a github repository.`);
                return [license_met, ramp_up_met, correctness_met];
            }
        }
        //console.log(repoURL);
        //probably need to add in something to check if the url is from github just to make sure 
        yield cloneRepository(repoURL, repoDir); //clones the repository
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
        correctness_met = yield calculate_correctness_metric(repoDir);
        //deletes the temporary directory that was made
        try {
            fse.removeSync(repoDir);
            //console.log('Temporary directory deleted.');
        }
        catch (err) {
            run_1.default.log({ 'level': 'error', 'message': `${err}` });
        }
        return ([license_met, ramp_up_met, correctness_met]);
    });
}
exports.license_ramp_up_metric = license_ramp_up_metric;
