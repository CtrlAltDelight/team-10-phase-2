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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip_license_ramp_up_metric = exports.zip_calculate_correctness_metric = exports.license_ramp_up_metric = exports.calculate_correctness_metric = exports.findAllFiles = exports.calculate_ramp_up_metric = exports.countWords = exports.findGitHubRepoUrl = void 0;
var run_1 = require("./run");
var fs = require("fs");
var fse = require("fs-extra");
var isomorphic_git_1 = require("isomorphic-git");
var node_1 = require("isomorphic-git/http/node");
var axios_1 = require("axios");
var tmp = require("tmp");
var eslint_1 = require("eslint");
var path_1 = require("path");
var compatibleLicenses = [
    'mit license',
    'bsd 2-clause "simplified" license',
    /(mit.*license|license.*mit)/i,
]; //inherited
var licensesRegex = [
    /gpl/i,
    /gnu lesser general public license/i,
    /gnu general public license/i,
    /gnu affero public license/i,
    /gnu all-permissive license/i,
    /mit/i,
    /apache2/i, // NOTE: apache1 is not compatible with LGPLv2.1
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
var concatLicense = compatibleLicenses.concat(licensesRegex);
function cloneRepository(repoUrl, localPath) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Clone the repository
                    return [4 /*yield*/, isomorphic_git_1.default.clone({
                            fs: fs,
                            http: node_1.default,
                            dir: localPath,
                            url: repoUrl,
                        })];
                case 1:
                    // Clone the repository
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    run_1.default.log({ 'level': 'error', 'message': "".concat(error_1) });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function findGitHubRepoUrl(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        var response, packageMetadata, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("https://registry.npmjs.org/".concat(packageName))];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        run_1.default.log({ 'level': 'error', 'message': "Failed to fetch package metadata for ".concat(packageName) });
                        return [2 /*return*/, 'none'];
                    }
                    packageMetadata = response.data;
                    //console.log(packageMetadata.repository);
                    //console.log(packageMetadata.repository.url);
                    // Check if the "repository" field exists in the package.json
                    if (packageMetadata.repository && packageMetadata.repository.url) {
                        return [2 /*return*/, 'https://' + packageMetadata.repository.url.match(/github\.com\/[^/]+\/[^/]+(?=\.git|$)/)];
                    }
                    else {
                        run_1.default.log({ 'level': 'error', 'message': "No repository URL found for ".concat(packageName) });
                        return [2 /*return*/, 'none'];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    run_1.default.log({ 'level': 'error', 'message': "".concat(error_2) });
                    return [2 /*return*/, 'none'];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.findGitHubRepoUrl = findGitHubRepoUrl;
// Function to count words in a string
function countWords(text) {
    var words = text.split(/\s+/);
    var nonEmptyWords = words.filter(function (word) { return word !== ''; });
    return nonEmptyWords.length;
}
exports.countWords = countWords;
// Function to calculate the score based on word count
function calculate_ramp_up_metric(wordCount, maxWordCount) {
    var maxScore = 1.0; // Maximum score
    // Calculate the score based on the word count relative to the max word count
    return Math.min(wordCount / maxWordCount, maxScore);
}
exports.calculate_ramp_up_metric = calculate_ramp_up_metric;
function findAllFiles(directory) {
    var allFiles = [];
    var codeExtensions = ['.ts']; //NEED TP MAKE THIS WORK FOR ALL DIFFERENT TYPES OF FILES BUT RIGHT NOW IT ONLY GOES THROUGH .TS FILES
    function traverseDirectory(currentDir) {
        var files = fs.readdirSync(currentDir);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filePath = (0, path_1.join)(currentDir, file);
            var stats = fs.statSync(filePath);
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
    return __awaiter(this, void 0, void 0, function () {
        var eslint, allFiles, results, totalIssues, _i, _a, result, lintScore, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    eslint = new eslint_1.ESLint();
                    allFiles = findAllFiles(filepath);
                    results = eslint.lintFiles(allFiles);
                    totalIssues = 0;
                    _i = 0;
                    return [4 /*yield*/, results];
                case 1:
                    _a = _b.sent();
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    result = _a[_i];
                    totalIssues += result.errorCount + result.warningCount;
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 2];
                case 4:
                    lintScore = 1 - Math.min(1, totalIssues / 1000.0);
                    return [2 /*return*/, lintScore];
                case 5:
                    error_3 = _b.sent();
                    //console.error('Error running ESLint:', error);
                    return [2 /*return*/, 0]; // Return 0 in case of an error
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.calculate_correctness_metric = calculate_correctness_metric;
function license_ramp_up_metric(repoURL) {
    return __awaiter(this, void 0, void 0, function () {
        var tempDir, repoDir, license_met, ramp_up_met, correctness_met, url, parts, readmePath, readmeContent, _i, compatibleLicenses_1, compatibleLicense, wordCount, maxWordCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tempDir = tmp.dirSync();
                    repoDir = tempDir.name;
                    license_met = 0;
                    ramp_up_met = 0;
                    correctness_met = 0;
                    //looks into tmpdir to make a temporay directory and then deleting at the end of the function 
                    //console.log(repoDir);
                    fse.ensureDir(repoDir); //will make sure the directory exists or will create a new one
                    url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
                    parts = url.split('/');
                    if (!(parts[0] === 'npmjs.com')) return [3 /*break*/, 2];
                    return [4 /*yield*/, findGitHubRepoUrl(parts[2])];
                case 1:
                    //console.log("This is a npmjs url");
                    //finds the github url of the npmjs module
                    //console.log(`This is the npmjs package ${parts[2]}`);
                    repoURL = _a.sent();
                    if (repoURL == null) {
                        //console.log(`This npmjs is not stored in a github repository.`);
                        return [2 /*return*/, [license_met, ramp_up_met, correctness_met]];
                    }
                    _a.label = 2;
                case 2: 
                //console.log(repoURL);
                //probably need to add in something to check if the url is from github just to make sure 
                return [4 /*yield*/, cloneRepository(repoURL, repoDir)];
                case 3:
                    //console.log(repoURL);
                    //probably need to add in something to check if the url is from github just to make sure 
                    _a.sent(); //clones the repository
                    readmePath = "".concat(repoDir, "/Readme.md");
                    readmeContent = 'none';
                    if (fs.existsSync(readmePath)) {
                        readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
                    }
                    else {
                        readmePath = "".concat(repoDir, "/readme.markdown");
                        if (fs.existsSync(readmePath)) {
                            readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
                        }
                    }
                    //CALCULATES THE LICENSE SCORE 
                    for (_i = 0, compatibleLicenses_1 = compatibleLicenses; _i < compatibleLicenses_1.length; _i++) {
                        compatibleLicense = compatibleLicenses_1[_i];
                        if (readmeContent.match(compatibleLicense)) {
                            license_met = 1; //License found was compatible 
                        }
                    }
                    wordCount = countWords(readmeContent);
                    maxWordCount = 2000;
                    ramp_up_met = calculate_ramp_up_metric(wordCount, maxWordCount); //calculates the actual score
                    return [4 /*yield*/, calculate_correctness_metric(repoDir)];
                case 4:
                    //CALUCLATES THE CORRECTNESS SCORE
                    correctness_met = _a.sent();
                    //deletes the temporary directory that was made
                    try {
                        fse.removeSync(repoDir);
                        //console.log('Temporary directory deleted.');
                    }
                    catch (err) {
                        run_1.default.log({ 'level': 'error', 'message': "".concat(err) });
                    }
                    return [2 /*return*/, ([license_met, ramp_up_met, correctness_met])];
            }
        });
    });
}
exports.license_ramp_up_metric = license_ramp_up_metric;
var lintTsFilesInZip = function (zip) { return __awaiter(void 0, void 0, void 0, function () {
    var eslint, lintResults, totalIssues, count, resultCount, lintTsFilesRecursively;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eslint = new eslint_1.ESLint();
                console.log('b');
                lintResults = [];
                totalIssues = 0;
                count = 0;
                resultCount = 0;
                lintTsFilesRecursively = function (zip, folderPath) {
                    if (folderPath === void 0) { folderPath = ''; }
                    return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // count += 1;
                            // console.log(count);
                            // console.log(folderPath);
                            zip.forEach(function (relativePath, zipEntry) { return __awaiter(void 0, void 0, void 0, function () {
                                var fullPath, subZip, content, filePath, results, error_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            fullPath = folderPath ? "".concat(folderPath, "/").concat(relativePath) : relativePath;
                                            if (!zipEntry.dir) return [3 /*break*/, 2];
                                            subZip = zip.folder(relativePath);
                                            // console.log(subZip);
                                            if (!subZip) {
                                                console.error("Error finding subfolder ".concat(fullPath, " in zip"));
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, lintTsFilesRecursively(subZip, fullPath)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 7];
                                        case 2:
                                            if (!relativePath.endsWith('.ts')) return [3 /*break*/, 7];
                                            // Lint TypeScript file
                                            console.log('linting ts file ' + fullPath);
                                            console.log(fullPath);
                                            return [4 /*yield*/, zipEntry.async('string')];
                                        case 3:
                                            content = _a.sent();
                                            filePath = fullPath;
                                            _a.label = 4;
                                        case 4:
                                            _a.trys.push([4, 6, , 7]);
                                            console.log(resultCount++);
                                            return [4 /*yield*/, eslint.lintText(content, { filePath: filePath })];
                                        case 5:
                                            results = _a.sent();
                                            console.log(results);
                                            // lintResults.push({ filePath, lintResults: results });
                                            totalIssues += results[0].errorCount + results[0].warningCount;
                                            return [3 /*break*/, 7];
                                        case 6:
                                            error_4 = _a.sent();
                                            console.error("Error linting ".concat(filePath, ":"), error_4);
                                            return [3 /*break*/, 7];
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    });
                };
                return [4 /*yield*/, lintTsFilesRecursively(zip)];
            case 1:
                _a.sent();
                return [2 /*return*/, lintResults];
        }
    });
}); };
function zip_calculate_correctness_metric(loadedZip) {
    return __awaiter(this, void 0, void 0, function () {
        var lintResults, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, lintTsFilesInZip(loadedZip)];
                case 1:
                    lintResults = _a.sent();
                    return [2 /*return*/, 0];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error running ESLint:', error_5);
                    return [2 /*return*/, 0]; // Return 0 in case of an error
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.zip_calculate_correctness_metric = zip_calculate_correctness_metric;
// Takes in a JSZip and returns arr source-based metrics (license, ramp-up, correctness)
function zip_license_ramp_up_metric(loadedZip) {
    return __awaiter(this, void 0, void 0, function () {
        var license_met, ramp_up_met, correctness_met, readmeFiles, readmeFile, readmeContent, _i, concatLicense_1, compatibleLicense, wordCount, maxWordCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    license_met = 0;
                    ramp_up_met = 0;
                    correctness_met = 0;
                    console.log('a');
                    readmeFiles = loadedZip.file(/readme\.md|readme\.markdown/i);
                    if (!readmeFiles) {
                        console.log({ 'level': 'error', 'message': "No README file found in the zip file." });
                        return [2 /*return*/, [0, 0, 0]];
                    }
                    readmeFile = readmeFiles[0];
                    return [4 /*yield*/, readmeFile.async('text')];
                case 1:
                    readmeContent = (_a.sent()).toLowerCase();
                    // console.log(readmeContent);
                    //CALCULATES THE LICENSE SCORE
                    for (_i = 0, concatLicense_1 = concatLicense; _i < concatLicense_1.length; _i++) {
                        compatibleLicense = concatLicense_1[_i];
                        if (readmeContent.match(compatibleLicense)) {
                            license_met = 1; //License found was compatible 
                            break; // no need to continue searching
                        }
                    }
                    wordCount = countWords(readmeContent);
                    maxWordCount = 2000;
                    ramp_up_met = calculate_ramp_up_metric(wordCount, maxWordCount);
                    return [4 /*yield*/, zip_calculate_correctness_metric(loadedZip)];
                case 2:
                    //CALUCLATES THE CORRECTNESS SCORE
                    correctness_met = _a.sent();
                    return [2 /*return*/, ([license_met, ramp_up_met, correctness_met])];
            }
        });
    });
}
exports.zip_license_ramp_up_metric = zip_license_ramp_up_metric;
