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
exports.gitifyZip = exports.gitifyURL = void 0;
const license_ramp_up_metric_1 = require("./license_ramp_up_metric");
// takes in NPM or git url, returns [gitUrl, owner, repo]
function gitifyURL(repoURL) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
        let sections = url.split('/');
        if (sections[0] === 'npmjs.com') {
            console.log({ 'level': 'info', 'message': `npmjs package: ${sections[2]}` });
            // Find the GitHub URL for the package
            repoURL = yield (0, license_ramp_up_metric_1.findGitHubRepoUrl)(sections[2]);
            if (repoURL === 'none') {
                console.log({ 'level': 'error', 'message': 'This npmjs package is not stored in a GitHub repository.' });
                return null;
            }
            // Get owner and repo from GitHub URL
            url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
            sections = url.split('/');
            sections[2] = sections[2].replace(/\.git$/i, '');
        }
        // Validate if the URL is a valid GitHub repository URL
        if (!repoURL.match(/^(https:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+$/i)) {
            console.log({ 'level': 'error', 'message': `Invalid GitHub repository URL: ${repoURL}` });
            return null;
        }
        console.log({ 'level': 'info', 'message': `GitHub URL: ${repoURL}` });
        console.log({ 'level': 'info', 'message': `GitHub owner: ${sections[1]}, GitHub repo: ${sections[2]}` });
        return [url, sections[1], sections[2]];
    });
}
exports.gitifyURL = gitifyURL;
function gitifyZip(zip) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the GitHub URL from the package.json file
        const packageJson = zip.file('package.json');
        if (packageJson === null) {
            console.log({ 'level': 'error', 'message': 'Invalid zip file: package.json not found.' });
            return null;
        }
        const packageJsonText = yield packageJson.async('string');
        const packageJsonObj = JSON.parse(packageJsonText);
        if (packageJsonObj.repository === undefined) {
            console.log({ 'level': 'error', 'message': 'Invalid zip file: repository not found in package.json.' });
            return null;
        }
        let repoURL = packageJsonObj.repository.url;
        if (repoURL === undefined) {
            console.log({ 'level': 'warning', 'message': 'no repository.url in package.json, trying repository field' });
            repoURL = `https://github.com/${packageJsonObj.repository}`;
        }
        if (!repoURL.match(/^(https:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+$/i)) {
            console.log({ 'level': 'error', 'message': `Invalid GitHub repository URL: ${repoURL}` });
            return null;
        }
        console.log({ 'level': 'info', 'message': `GitHub URL: ${repoURL}` });
        const url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
        const sections = url.split('/');
        console.log({ 'level': 'info', 'message': `GitHub owner: ${sections[1]}, GitHub repo: ${sections[2]}` });
        return [url, sections[1], sections[2]];
    });
}
exports.gitifyZip = gitifyZip;
