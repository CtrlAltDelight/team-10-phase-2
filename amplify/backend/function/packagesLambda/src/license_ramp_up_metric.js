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
exports.zip_license_ramp_up_metric = exports.zip_calculate_correctness_metric = exports.getIssuesInZip = exports.calculate_ramp_up_metric = exports.countWords = exports.findGitHubRepoUrl = void 0;
var axios_1 = require("axios");
var eslint_1 = require("eslint");
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
// async function cloneRepository(repoUrl: string, localPath: string): Promise<void> { 
//   try {
//     // Clone the repository
//     await git.clone({
//       fs,
//       http,
//       dir: localPath,
//       url: repoUrl,
//     });
//     //console.log('Repository cloned successfully.');
//   } catch (error) {
//     console.log({'level': 'error', 'message': `${error}`});
//   }
// }
function findGitHubRepoUrl(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        var response, packageMetadata, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("https://registry.npmjs.org/".concat(packageName))];
                case 1:
                    response = _a.sent();
                    // console.log("got here")
                    // console.log(response);
                    // console.log(response.status);
                    if (response.status !== 200) {
                        console.log({ 'level': 'error', 'message': "Failed to fetch package metadata for ".concat(packageName) });
                        return [2 /*return*/, 'none'];
                    }
                    packageMetadata = response.data;
                    // console.log(packageMetadata);
                    //console.log(packageMetadata.repository);
                    //console.log(packageMetadata.repository.url);
                    // Check if the "repository" field exists in the package.json
                    if (packageMetadata.repository && packageMetadata.repository.url) {
                        return [2 /*return*/, 'https://' + packageMetadata.repository.url.match(/github\.com\/[^/]+\/[^/]+(?=\.git|$)/)];
                    }
                    else {
                        console.log({ 'level': 'error', 'message': "No repository URL found for ".concat(packageName) });
                        return [2 /*return*/, 'none'];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log({ 'level': 'error', 'message': "".concat(error_1) });
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
// export function findAllFiles(directory: string): string[] {
//   const allFiles: string[] = []; 
//   const codeExtensions = ['.ts']; //NEED TP MAKE THIS WORK FOR ALL DIFFERENT TYPES OF FILES BUT RIGHT NOW IT ONLY GOES THROUGH .TS FILES
//   function traverseDirectory(currentDir: string) {
//     const files = fs.readdirSync(currentDir);
//     for (const file of files) {
//       const filePath = join(currentDir, file);
//       const stats = fs.statSync(filePath);
//       if (stats.isDirectory()) {
//         // Recursively traverse subdirectories
//         traverseDirectory(filePath);
//       } else if (codeExtensions.includes(extname(filePath))) {
//         allFiles.push(filePath);
//       }
//     }
//   }
//   traverseDirectory(directory);
//   return allFiles; 
// }
// export async function calculate_correctness_metric(filepath: string): Promise<number> {
//   try {
//     // Initailize ESLint
//     const eslint = new ESLint(); 
//     //Get a list of Typescript files with the cloned directory
//     const allFiles = findAllFiles(filepath); 
//     //Lint in Typescript files
//     const results = eslint.lintFiles(allFiles); 
//     // Calculate the total number of issues (errors + warnings)
//     let totalIssues = 0; 
//     for (const result of await results) 
//     {
//       totalIssues += result.errorCount + result.warningCount; 
//     }
//     // Calculate the lint score as a value between 0 and 1
//     const lintScore = 1 - Math.min(1, totalIssues / 1000.0);
//     return lintScore;
//   } catch (error) {
//     //console.error('Error running ESLint:', error);
//     return 0; // Return 0 in case of an error
//   }
// }
// export async function license_ramp_up_metric(repoURL: string): Promise<number[]> {
//     const tempDir = tmp.dirSync(); //makes a temporary directory
//     const repoDir = tempDir.name; 
//     let license_met = 0;
//     let ramp_up_met = 0;  
//     let correctness_met = 0; 
//     //looks into tmpdir to make a temporay directory and then deleting at the end of the function 
//     //console.log(repoDir);
//     fse.ensureDir(repoDir); //will make sure the directory exists or will create a new one
//     //check the URL to see if it is a github url or a npmjs url 
//     const url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
//     const parts = url.split('/'); 
//     if(parts[0] === 'npmjs.com') {
//       //console.log("This is a npmjs url");
//       //finds the github url of the npmjs module
//       //console.log(`This is the npmjs package ${parts[2]}`);
//       repoURL = await findGitHubRepoUrl(parts[2]);
//       if(repoURL == null) {
//         //console.log(`This npmjs is not stored in a github repository.`);
//         return [license_met, ramp_up_met, correctness_met]; 
//       }
//     }
//     //console.log(repoURL);
//     //probably need to add in something to check if the url is from github just to make sure 
//     await cloneRepository(repoURL, repoDir); //clones the repository
//     //Reads in the cloned repository
//     let readmePath = `${repoDir}/Readme.md`; 
//     let readmeContent = 'none';
//     if(fs.existsSync(readmePath)) {
//       readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
//     } else {
//       readmePath = `${repoDir}/readme.markdown`; 
//       if(fs.existsSync(readmePath)) {
//         readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
//       } 
//     }
//     //CALCULATES THE LICENSE SCORE 
//     for(const compatibleLicense of compatibleLicenses) {
//       if(readmeContent.match(compatibleLicense)) {
//         license_met = 1; //License found was compatible 
//       }
//     }
//     //CALCULATES THE RAMPUP SCORE 
//     const wordCount = countWords(readmeContent); //gets the number of words in the README
//     const maxWordCount = 2000; //NEED TO ADJUST THIS NUMBER BASED ON WHAT WE GET FROM DIFFERENT TEST RESULTS
//     ramp_up_met = calculate_ramp_up_metric(wordCount, maxWordCount); //calculates the actual score
//     //CALUCLATES THE CORRECTNESS SCORE
//     correctness_met =  await calculate_correctness_metric(repoDir); 
//     //deletes the temporary directory that was made
//     try {
//       fse.removeSync(repoDir); 
//       //console.log('Temporary directory deleted.');
//     } catch (err) {
//       console.log({'level': 'error', 'message': `${err}`});
//     }
//     return([license_met, ramp_up_met, correctness_met]); 
// }
function getIssuesInZip(zip) {
    return __awaiter(this, void 0, void 0, function () {
        var eslint, totalIssues, _i, _a, _b, path, file, content, filePath, results, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    eslint = new eslint_1.ESLint();
                    totalIssues = 0;
                    _i = 0, _a = Object.entries(zip.files);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], path = _b[0], file = _b[1];
                    // console.log(file);
                    if (file.dir) {
                        return [3 /*break*/, 6];
                    }
                    if (!(file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) return [3 /*break*/, 6];
                    return [4 /*yield*/, file.async('string')];
                case 2:
                    content = _c.sent();
                    filePath = file.name;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, eslint.lintText(content, { filePath: filePath })];
                case 4:
                    results = _c.sent();
                    // console.log(results);
                    totalIssues += results[0].errorCount + results[0].warningCount;
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _c.sent();
                    console.error("Error linting ".concat(filePath, ":"), error_2);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, totalIssues];
            }
        });
    });
}
exports.getIssuesInZip = getIssuesInZip;
function zip_calculate_correctness_metric(loadedZip) {
    return __awaiter(this, void 0, void 0, function () {
        var totalIssues, lintScore, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getIssuesInZip(loadedZip)];
                case 1:
                    totalIssues = _a.sent();
                    lintScore = 1 - Math.min(1, totalIssues / 1000.0);
                    return [2 /*return*/, lintScore];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error running ESLint:', error_3);
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
                    console.log([license_met, ramp_up_met, correctness_met]);
                    return [2 /*return*/, ([license_met, ramp_up_met, correctness_met])];
            }
        });
    });
}
exports.zip_license_ramp_up_metric = zip_license_ramp_up_metric;
