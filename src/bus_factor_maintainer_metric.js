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
exports.bus_factor_maintainer_metric = exports.calcResponsiveMaintainer = exports.calcBusFactor = exports.fetchGraphQL = exports.fetchResponse = void 0;
const run_1 = require("./run");
const graphql_1 = require("@octokit/graphql");
const license_ramp_up_metric_1 = require("./license_ramp_up_metric");
const node_fetch_1 = require("node-fetch");
function fetchResponse(queryUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, node_fetch_1.default)(queryUrl, {
                headers: {
                    authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
            });
            if (response.status !== 200) {
                run_1.default.log({ 'level': 'error', 'message': `For API query ${queryUrl}` });
                run_1.default.log({ 'level': 'error', 'message': `Failed to fetch GitHub REST API response: Response ${response.status}` });
                throw new Error(`Failed to fetch GitHub REST API response: Response ${response.status}`);
            }
            return response;
        }
        catch (error) {
            run_1.default.log({ 'level': 'error', 'message': `For API query ${queryUrl}` });
            run_1.default.log({ 'level': 'error', 'message': `Error fetching GitHub REST API response: ${error}` });
            throw error;
        }
    });
}
exports.fetchResponse = fetchResponse;
function fetchGraphQL(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const gqlRequest = yield (0, graphql_1.graphql)(query, {
                headers: {
                    authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
                request: {
                    fetch: node_fetch_1.default,
                },
            });
            return gqlRequest;
        }
        catch (error) {
            run_1.default.log({ 'level': 'error', 'message': `Error fetching GitHub repository via GraphQL: ${error}` });
            throw error;
        }
    });
}
exports.fetchGraphQL = fetchGraphQL;
function calcBusFactor(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Make GitHub REST API call to get (up to 10) contributors to calculate impact for bus factor metric
        const queryUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`;
        const response = yield fetchResponse(queryUrl).catch((error) => {
            return null;
        });
        // return score of 0 if REST API call fails
        if (response === null) {
            return 0;
        }
        const contributors = yield response.json();
        let busFactor = 0;
        // Calculate impact for each contributor
        contributors.forEach((contributor) => {
            let impact = 0;
            // Add number of commits by contributor to impact
            impact += 0.6 * Math.min(contributor.contributions / 20, 1);
            // make API call to get number of pull requests created by contributor
            const prQueryUrl = `https://api.github.com/search/issues?q=author:${contributor.login}+type:pr+repo:${owner}/${repo}`;
            fetchResponse(prQueryUrl).then((response) => {
                if (response !== null) {
                    response.json().then((data) => {
                        impact += 0.25 * Math.min(data.total_count / 5, 1);
                    });
                }
            })
                .catch((error) => {
                run_1.default.log({ 'level': 'error', 'message': `Error fetching GitHub REST API response for number of PRs from ${contributor.login}: ${error}` });
            });
            // make API call to get number of code reviews by contributor
            const crQueryUrl = `https://api.github.com/search/issues?q=review-requested:${contributor.login}+type:pr+repo:${owner}/${repo}`;
            fetchResponse(crQueryUrl).then((response) => {
                if (response !== null) {
                    response.json().then((data) => {
                        impact += 0.15 * Math.min(data.total_count / 5, 1);
                    });
                }
            })
                .catch((error) => {
                run_1.default.log({ 'level': 'error', 'message': `Error fetching GitHub REST API response for number of code reviews from ${contributor.login}: ${error}` });
            });
            // Add impact to bus factor
            busFactor += impact * 0.1;
        });
        // Ensure bus factor is between 0 and 1
        return Math.min(busFactor, 1);
    });
}
exports.calcBusFactor = calcBusFactor;
function calcResponsiveMaintainer(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let responsive_maintainer = 0;
        // Make GitHub REST API call to get number of contributors to calculate part of responsive maintainer metric
        // Trick: List 1 contributor per page and use rel="last" in header to get total number of contributors
        const queryUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`;
        const response = yield fetchResponse(queryUrl).catch((error) => {
            return null;
        });
        // return score of 0 if REST API call fails
        if (response === null) {
            return 0;
        }
        const header = response.headers.get('link');
        let matchResult;
        let lastPage;
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
        // Make GraphQL query to GitHub API to get date of (up to 5) most recent pull requests to calculate part of responsive maintainer metric
        const query = `
    {
      repository(owner: "${owner}", name: "${repo}") {
        pullRequests(last: 3, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            createdAt
          }
        }
      }
    }
  `;
        const gqlResponse = yield fetchGraphQL(query).catch((error) => {
            return null;
        });
        // return score of 0 if GraphQL query fails
        if (gqlResponse === null) {
            return 0;
        }
        // Iterate through (up to 5) PRs to calculate part of responsive maintainer metric
        // Calculate number of days since each PR was created (best if within past 2 weeks)
        gqlResponse.repository.pullRequests.nodes.forEach((pullRequest) => {
            const daysSince = Math.floor((new Date().getTime() - new Date(pullRequest.createdAt).getTime()) / (1000 * 3600 * 24));
            responsive_maintainer += 0.1 * Math.min(14 / Math.max(daysSince, 14), 1);
            run_1.default.log({ 'level': 'info', 'message': `Pull request created at: ${pullRequest.createdAt}` });
        });
        return responsive_maintainer;
    });
}
exports.calcResponsiveMaintainer = calcResponsiveMaintainer;
// Fetch package.json from the GitHub repository
function fetchPackageJson(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        // const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        // try {
        //     // const response = await octokit.repos.getContent({
        //     //     owner: owner,
        //     //     repo: repo,
        //     //     path: 'package.json',
        //     // });
        //     // // Check if the response data is of the expected type
        //     // const data = response.data as FileContentResponse;
        //     // if ('type' in data && data.type === 'file' && 'content' in data) {
        //       // const content = Buffer.from(data.content, 'base64').toString();
        //       // return JSON.parse(content);
        //     }
        // } catch (error) {
        //     logger.log({'level': 'error', 'message': `Error fetching package.json: ${error}`});
        //     return null;
        // }
    });
}
// Calculate the dependencies metric
function calcDependenciesMetric(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        // const packageJson = await fetchPackageJson(owner, repo);
        // if (!packageJson) return 0; // Return 0 if package.json is not found
        // const dependencies = {...packageJson.dependencies, ...packageJson.devDependencies};
        // if (Object.keys(dependencies).length === 0) return 1.0; // Return 1.0 if no dependencies
        // let pinnedDependencies = 0;
        // Object.values(dependencies).forEach((version: string) => {
        //     if (version.match(/^\d+\.\d+\./)) { // Regex to check if version is pinned to major.minor
        //         pinnedDependencies++;
        //     }
        // });
        // return pinnedDependencies / Object.keys(dependencies).length;
    });
}
// Function to fetch pull requests from the GitHub repository
// async function fetchPullRequests(owner: string, repo: string, octokit: Octokit): Promise<any[]> {
//     try {
//         const prs = await octokit.paginate(octokit.pulls.list, {
//             owner: owner,
//             repo: repo,
//             state: 'closed',  // considering only merged/closed PRs
//             per_page: 100
//         });
//         return prs;
//     } catch (error) {
//         logger.log({'level': 'error', 'message': `Error fetching pull requests: ${error}`});
//         return [];
//     }
// }
// // Function to calculate the codeReview metric
// async function calcCodeReviewMetric(owner: string, repo: string): Promise<number> {
//     const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
//     let pullRequests;
//     try { // Getting all pull requests
//         pullRequests = await fetchPullRequests(owner, repo, octokit);
//     } catch (error) {
//         logger.log({'level': 'error', 'message': `Error fetching pull requests: ${error}`});
//         return 0;
//     }
//     if (!pullRequests || pullRequests.length === 0) {
//         logger.log({'level': 'info', 'message': 'No pull requests found or error in fetching.'});
//         return 0;
//     }
//     const prData = pullRequests.map(pr => ({
//         number: pr.number,
//         additions: pr.additions,
//         deletions: pr.deletions
//     }));
//     let totalCodeChanges = 0;
//     let reviewedCodeChanges = 0;
//     for (const pr of prData) {
//         try {
//             const reviews = await octokit.pulls.listReviews({
//                 owner: owner,
//                 repo: repo,
//                 pull_number: pr.number
//             });
//             const info = await octokit.pulls.get({
//                 owner: owner,
//                 repo: repo,
//                 pull_number: pr.number
//             })
//             totalCodeChanges += info.data.additions + info.data.deletions;
//             if (reviews.data.length > 0) {
//                 reviewedCodeChanges += info.data.additions + info.data.deletions;
//             }
//         } catch (error) {
//             logger.log({'level': 'error', 'message': `Error processing PR #${pr.number}: ${error}`});
//         }
//     }
//     if (totalCodeChanges === 0) {
//         logger.log({'level': 'info', 'message': 'Total code changes are zero.'});
//         return 0; // Avoid division by zero
//     }
//     return reviewedCodeChanges / totalCodeChanges;
// }
// /* End added by Luke */
function bus_factor_maintainer_metric(repoURL) {
    return __awaiter(this, void 0, void 0, function* () {
        // Metrics to be calculated
        let bus_factor = 0;
        let responsive_maintainer = 0;
        const dependencies = 0; // Added by Luke
        const code_review = 0; // Added by Luke
        // Check whether the URL is GitHub or NPMJS URL
        let url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
        let sections = url.split('/');
        if (sections[0] === 'npmjs.com') {
            run_1.default.log({ 'level': 'info', 'message': `npmjs package: ${sections[2]}` });
            // Find the GitHub URL for the package
            repoURL = yield (0, license_ramp_up_metric_1.findGitHubRepoUrl)(sections[2]);
            if (repoURL === 'none') {
                run_1.default.log({ 'level': 'error', 'message': 'This npmjs package is not stored in a GitHub repository.' });
                return [0, 0];
            }
            // Get owner and repo from GitHub URL
            url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
            sections = url.split('/');
            sections[2] = sections[2].replace(/\.git$/i, '');
        }
        // Check if the URL is a valid GitHub repository URL
        if (!repoURL.match(/^(https:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+$/i)) {
            run_1.default.log({ 'level': 'error', 'message': `Invalid GitHub repository URL: ${repoURL}` });
            return [0, 0];
        }
        run_1.default.log({ 'level': 'info', 'message': `GitHub URL: ${repoURL}` });
        run_1.default.log({ 'level': 'info', 'message': `GitHub owner: ${sections[1]}, GitHub repo: ${sections[2]}` });
        // Calculate bus factor metric
        bus_factor = yield calcBusFactor(sections[1], sections[2]);
        // Calculate responsive maintainer metric
        responsive_maintainer = yield calcResponsiveMaintainer(sections[1], sections[2]);
        // Calculate dependencies metric Added by Luke.
        // dependencies = await calcDependenciesMetric(sections[1], sections[2]);
        // Calculate code review metric. Added by Luke.
        // code_review = await calcCodeReviewMetric(sections[1], sections[2]);
        return [bus_factor, responsive_maintainer, dependencies, code_review]; // Modified by Luke.
    });
}
exports.bus_factor_maintainer_metric = bus_factor_maintainer_metric;
