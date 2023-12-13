#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.bus_factor_maintainer_metric = exports.calcResponsiveMaintainer = exports.calcBusFactor = exports.fetchGraphQL = exports.fetchResponse = void 0;
var graphql_1 = require("@octokit/graphql");
var license_ramp_up_metric_1 = require("./license_ramp_up_metric");
var node_fetch_1 = require("node-fetch");
function fetchResponse(queryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(queryUrl, {
                            headers: {
                                authorization: "token ".concat(process.env.GITHUB_TOKEN),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        console.log({ 'level': 'error', 'message': "For API query ".concat(queryUrl) });
                        console.log({ 'level': 'error', 'message': "Failed to fetch GitHub REST API response: Response ".concat(response.status) });
                        throw new Error("Failed to fetch GitHub REST API response: Response ".concat(response.status));
                    }
                    return [2 /*return*/, response];
                case 2:
                    error_1 = _a.sent();
                    console.log({ 'level': 'error', 'message': "For API query ".concat(queryUrl) });
                    console.log({ 'level': 'error', 'message': "Error fetching GitHub REST API response: ".concat(error_1) });
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.fetchResponse = fetchResponse;
function fetchGraphQL(query) {
    return __awaiter(this, void 0, void 0, function () {
        var gqlRequest, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, graphql_1.graphql)(query, {
                            headers: {
                                authorization: "token ".concat(process.env.GITHUB_TOKEN),
                            },
                            request: {
                                fetch: node_fetch_1.default,
                            },
                        })];
                case 1:
                    gqlRequest = _a.sent();
                    return [2 /*return*/, gqlRequest];
                case 2:
                    error_2 = _a.sent();
                    console.log({ 'level': 'error', 'message': "Error fetching GitHub repository via GraphQL: ".concat(error_2) });
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.fetchGraphQL = fetchGraphQL;
function calcBusFactor(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var queryUrl, response, contributors, busFactor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/contributors?per_page=10");
                    return [4 /*yield*/, fetchResponse(queryUrl).catch(function (error) {
                            return null;
                        })];
                case 1:
                    response = _a.sent();
                    // return score of 0 if REST API call fails
                    if (response === null) {
                        return [2 /*return*/, 0];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    contributors = _a.sent();
                    busFactor = 0;
                    // Calculate impact for each contributor
                    contributors.forEach(function (contributor) {
                        var impact = 0;
                        // Add number of commits by contributor to impact
                        impact += 0.6 * Math.min(contributor.contributions / 20, 1);
                        // make API call to get number of pull requests created by contributor
                        var prQueryUrl = "https://api.github.com/search/issues?q=author:".concat(contributor.login, "+type:pr+repo:").concat(owner, "/").concat(repo);
                        fetchResponse(prQueryUrl).then(function (response) {
                            if (response !== null) {
                                response.json().then(function (data) {
                                    impact += 0.25 * Math.min(data.total_count / 5, 1);
                                });
                            }
                        })
                            .catch(function (error) {
                            console.log({ 'level': 'error', 'message': "Error fetching GitHub REST API response for number of PRs from ".concat(contributor.login, ": ").concat(error) });
                        });
                        // make API call to get number of code reviews by contributor
                        var crQueryUrl = "https://api.github.com/search/issues?q=review-requested:".concat(contributor.login, "+type:pr+repo:").concat(owner, "/").concat(repo);
                        fetchResponse(crQueryUrl).then(function (response) {
                            if (response !== null) {
                                response.json().then(function (data) {
                                    impact += 0.15 * Math.min(data.total_count / 5, 1);
                                });
                            }
                        })
                            .catch(function (error) {
                            console.log({ 'level': 'error', 'message': "Error fetching GitHub REST API response for number of code reviews from ".concat(contributor.login, ": ").concat(error) });
                        });
                        // Add impact to bus factor
                        busFactor += impact * 0.1;
                    });
                    // Ensure bus factor is between 0 and 1
                    return [2 /*return*/, Math.min(busFactor, 1)];
            }
        });
    });
}
exports.calcBusFactor = calcBusFactor;
function calcResponsiveMaintainer(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var responsive_maintainer, queryUrl, response, header, matchResult, lastPage, query, gqlResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    responsive_maintainer = 0;
                    queryUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/contributors?per_page=1&anon=1");
                    return [4 /*yield*/, fetchResponse(queryUrl).catch(function (error) {
                            return null;
                        })];
                case 1:
                    response = _a.sent();
                    // return score of 0 if REST API call fails
                    if (response === null) {
                        return [2 /*return*/, 0];
                    }
                    header = response.headers.get('link');
                    if (header) {
                        matchResult = header.match(/page=(\d+)>; rel="last"/);
                        if (matchResult) {
                            lastPage = parseInt(matchResult[1]);
                        }
                        else {
                            lastPage = 0;
                        }
                    }
                    else {
                        lastPage = 0;
                    }
                    responsive_maintainer += Math.min(0.5, lastPage / 15);
                    query = "\n  {\n    repository(owner: \"".concat(owner, "\", name: \"").concat(repo, "\") {\n      pullRequests(last: 3, orderBy: {field: CREATED_AT, direction: DESC}) {\n        nodes {\n          createdAt\n        }\n      }\n    }\n  }\n");
                    return [4 /*yield*/, fetchGraphQL(query).catch(function (error) {
                            return null;
                        })];
                case 2:
                    gqlResponse = _a.sent();
                    // return score of 0 if GraphQL query fails
                    if (gqlResponse === null) {
                        return [2 /*return*/, 0];
                    }
                    // Iterate through (up to 5) PRs to calculate part of responsive maintainer metric
                    // Calculate number of days since each PR was created (best if within past 2 weeks)
                    gqlResponse.repository.pullRequests.nodes.forEach(function (pullRequest) {
                        var daysSince = Math.floor((new Date().getTime() - new Date(pullRequest.createdAt).getTime()) / (1000 * 3600 * 24));
                        responsive_maintainer += 0.1 * Math.min(14 / Math.max(daysSince, 14), 1);
                        // console.log({'level': 'info', 'message': `Pull request created at: ${pullRequest.createdAt}`});
                    });
                    return [2 /*return*/, responsive_maintainer];
            }
        });
    });
}
exports.calcResponsiveMaintainer = calcResponsiveMaintainer;
/* Added by Luke */
// Additional imports if needed
var rest_1 = require("@octokit/rest"); // Added this to ./run install script
// Fetch package.json from the GitHub repository
function fetchPackageJson(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, response, data, content, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN,
                        request: { fetch: node_fetch_1.default } });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, octokit.repos.getContent({
                            owner: owner,
                            repo: repo,
                            path: 'package.json',
                        })];
                case 2:
                    response = _a.sent();
                    data = response.data;
                    if ('type' in data && data.type === 'file' && 'content' in data) {
                        content = Buffer.from(data.content, 'base64').toString();
                        return [2 /*return*/, JSON.parse(content)];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.log({ 'level': 'error', 'message': "Error fetching package.json: ".concat(error_3) });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Calculate the dependencies metric
function calcDependenciesMetric(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var packageJson, dependencies, pinnedDependencies;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchPackageJson(owner, repo)];
                case 1:
                    packageJson = _a.sent();
                    if (!packageJson)
                        return [2 /*return*/, 0]; // Return 0 if package.json is not found
                    dependencies = __assign(__assign({}, packageJson.dependencies), packageJson.devDependencies);
                    if (Object.keys(dependencies).length === 0)
                        return [2 /*return*/, 1.0]; // Return 1.0 if no dependencies
                    pinnedDependencies = 0;
                    Object.values(dependencies).forEach(function (version) {
                        if (version.match(/^\d+\.\d+\./)) { // Regex to check if version is pinned to major.minor
                            pinnedDependencies++;
                        }
                    });
                    return [2 /*return*/, pinnedDependencies / Object.keys(dependencies).length];
            }
        });
    });
}
// Function to fetch pull requests from the GitHub repository
function fetchPullRequests(owner, repo, octokit) {
    return __awaiter(this, void 0, void 0, function () {
        var prs, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.paginate(octokit.pulls.list, {
                            owner: owner,
                            repo: repo,
                            state: 'closed', // considering only merged/closed PRs
                            per_page: 100
                        })];
                case 1:
                    prs = _a.sent();
                    return [2 /*return*/, prs];
                case 2:
                    error_4 = _a.sent();
                    console.log({ 'level': 'error', 'message': "Error fetching pull requests: ".concat(error_4) });
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// // Function to calculate the codeReview metric
function calcCodeReviewMetric(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, pullRequests, error_5, prData, totalCodeChanges, reviewedCodeChanges, _i, prData_1, pr, reviews, info, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN,
                        request: { fetch: node_fetch_1.default } });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchPullRequests(owner, repo, octokit)];
                case 2:
                    pullRequests = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.log({ 'level': 'error', 'message': "Error fetching pull requests: ".concat(error_5) });
                    return [2 /*return*/, 0];
                case 4:
                    if (!pullRequests || pullRequests.length === 0) {
                        console.log({ 'level': 'info', 'message': 'No pull requests found or error in fetching.' });
                        return [2 /*return*/, 0];
                    }
                    prData = pullRequests.map(function (pr) { return ({
                        number: pr.number,
                        additions: pr.additions,
                        deletions: pr.deletions
                    }); });
                    totalCodeChanges = 0;
                    reviewedCodeChanges = 0;
                    _i = 0, prData_1 = prData;
                    _a.label = 5;
                case 5:
                    if (!(_i < prData_1.length)) return [3 /*break*/, 11];
                    pr = prData_1[_i];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 9, , 10]);
                    return [4 /*yield*/, octokit.pulls.listReviews({
                            owner: owner,
                            repo: repo,
                            pull_number: pr.number
                        })];
                case 7:
                    reviews = _a.sent();
                    return [4 /*yield*/, octokit.pulls.get({
                            owner: owner,
                            repo: repo,
                            pull_number: pr.number
                        })];
                case 8:
                    info = _a.sent();
                    totalCodeChanges += info.data.additions + info.data.deletions;
                    if (reviews.data.length > 0) {
                        reviewedCodeChanges += info.data.additions + info.data.deletions;
                    }
                    return [3 /*break*/, 10];
                case 9:
                    error_6 = _a.sent();
                    console.log({ 'level': 'error', 'message': "Error processing PR #".concat(pr.number, ": ").concat(error_6) });
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 5];
                case 11:
                    if (totalCodeChanges === 0) {
                        console.log({ 'level': 'info', 'message': 'Total code changes are zero.' });
                        return [2 /*return*/, 0]; // Avoid division by zero
                    }
                    return [2 /*return*/, reviewedCodeChanges / totalCodeChanges];
            }
        });
    });
}
// /* End added by Luke */
function bus_factor_maintainer_metric(repoURL) {
    return __awaiter(this, void 0, void 0, function () {
        var bus_factor, responsive_maintainer, dependencies, code_review, url, sections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bus_factor = 0;
                    responsive_maintainer = 0;
                    dependencies = 0;
                    code_review = 0;
                    url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
                    sections = url.split('/');
                    if (!(sections[0] === 'npmjs.com')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, license_ramp_up_metric_1.findGitHubRepoUrl)(sections[2])];
                case 1:
                    // console.log({'level': 'info', 'message': `npmjs package: ${sections[2]}`});
                    // Find the GitHub URL for the package
                    repoURL = _a.sent();
                    if (repoURL === 'none') {
                        console.log({ 'level': 'error', 'message': 'This npmjs package is not stored in a GitHub repository.' });
                        return [2 /*return*/, [0, 0]];
                    }
                    // Get owner and repo from GitHub URL
                    url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
                    sections = url.split('/');
                    sections[2] = sections[2].replace(/\.git$/i, '');
                    _a.label = 2;
                case 2:
                    // Check if the URL is a valid GitHub repository URL
                    if (!repoURL.match(/^(https:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+$/i)) {
                        console.log({ 'level': 'error', 'message': "Invalid GitHub repository URL: ".concat(repoURL) });
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, calcBusFactor(sections[1], sections[2])];
                case 3:
                    // console.log({'level': 'info', 'message': `GitHub URL: ${repoURL}`});
                    // console.log({'level': 'info', 'message': `GitHub owner: ${sections[1]}, GitHub repo: ${sections[2]}`});
                    // Calculate bus factor metric
                    bus_factor = _a.sent();
                    return [4 /*yield*/, calcResponsiveMaintainer(sections[1], sections[2])];
                case 4:
                    // Calculate responsive maintainer metric
                    responsive_maintainer = _a.sent();
                    return [4 /*yield*/, calcDependenciesMetric(sections[1], sections[2])];
                case 5:
                    // Calculate dependencies metric Added by Luke.
                    dependencies = _a.sent();
                    return [4 /*yield*/, calcCodeReviewMetric(sections[1], sections[2])];
                case 6:
                    // Calculate code review metric. Added by Luke.
                    code_review = _a.sent();
                    return [2 /*return*/, [bus_factor, responsive_maintainer, dependencies, code_review]]; // Modified by Luke.
            }
        });
    });
}
exports.bus_factor_maintainer_metric = bus_factor_maintainer_metric;
