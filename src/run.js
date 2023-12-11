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
exports.runTests = exports.processUrls = void 0;
var fs = require("fs");
var license_ramp_up_metric_1 = require("./license_ramp_up_metric");
var bus_factor_maintainer_metric_1 = require("./bus_factor_maintainer_metric");
var dotenv = require("dotenv");
var winston = require("winston");
var process_1 = require("process");
var JSZip = require("jszip");
// Function to process URL_FILE and produce NDJSON output
function processUrls(urlFile) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileContents, urls, l_r_metric_array, bf_rm_metric_array, net_score, _i, urls_1, url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    filePath = urlFile;
                    fileContents = fs.readFileSync(filePath, 'utf-8');
                    urls = fileContents.split('\n').filter(function (url) { return url.trim() !== ''; });
                    l_r_metric_array = void 0;
                    bf_rm_metric_array = void 0;
                    net_score = 0;
                    _i = 0, urls_1 = urls;
                    _a.label = 1;
                case 1:
                    if (!(_i < urls_1.length)) return [3 /*break*/, 5];
                    url = urls_1[_i];
                    logger.log({ 'level': 'info', 'message': "The URL that is currently running is ".concat(url) });
                    return [4 /*yield*/, (0, license_ramp_up_metric_1.license_ramp_up_metric)(url)];
                case 2:
                    l_r_metric_array = _a.sent(); //returns license metric first and then ramp up metric
                    logger.log({ 'level': 'info', 'message': "The license metric is ".concat(l_r_metric_array[0]) });
                    logger.log({ 'level': 'info', 'message': "The ramp up metric is ".concat(l_r_metric_array[1]) });
                    logger.log({ 'level': 'info', 'message': "The correctness metric is ".concat(l_r_metric_array[2]) });
                    return [4 /*yield*/, (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(url)];
                case 3:
                    bf_rm_metric_array = _a.sent();
                    logger.log({ 'level': 'info', 'message': "The bus factor metric is ".concat(bf_rm_metric_array[0]) });
                    logger.log({ 'level': 'info', 'message': "The responsive maintainer metric is ".concat(bf_rm_metric_array[1]) });
                    logger.log({ 'level': 'info', 'message': "The dependency metric is ".concat(bf_rm_metric_array[2]) });
                    logger.log({ 'level': 'info', 'message': "The code_review metric is ".concat(bf_rm_metric_array[3]) });
                    // Calculate net score: (0.35 * correctness + 0.25 * maintainer + 0.2 * bus factor + 0.2 * ramp up) * license
                    net_score = (0.35 * l_r_metric_array[2] + 0.25 * bf_rm_metric_array[1] + 0.2 * bf_rm_metric_array[0] + 0.2 * l_r_metric_array[1]) * l_r_metric_array[0];
                    console.log("{\"URL\":\"".concat(url, "\", \"NET_SCORE\":").concat(net_score.toFixed(5), ", \"RAMP_UP_SCORE\":").concat(l_r_metric_array[1].toFixed(5), ", \"CORRECTNESS_SCORE\":").concat(l_r_metric_array[2].toFixed(5), ", \"BUS_FACTOR_SCORE\":").concat(bf_rm_metric_array[0].toFixed(5), ", \"RESPONSIVE_MAINTAINER_SCORE\":").concat(bf_rm_metric_array[1].toFixed(5), ", \"LICENSE_SCORE\":").concat(l_r_metric_array[0].toFixed(5), "}"));
                    console.log("NEW METRIC! Dependencies-score: ".concat(bf_rm_metric_array[2], ", CodeReview-score: ").concat(bf_rm_metric_array[3], "\n"));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    logger.log({ 'level': 'error', 'message': "".concat(err_1) });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.processUrls = processUrls;
// Function to run the test suite
function runTests(file) {
    //Parsing the output from Jest here 
    var text = fs.readFileSync(file, 'utf-8');
    var lines = text.split('\n');
    var totalTests = 0;
    var passedTests = 0;
    var coveragePercentage = 0;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.includes('Tests: ')) {
            var match = line.match(/(\d+) passed/);
            if (match) {
                passedTests = parseInt(match[1]);
            }
            match = line.match(/(\d+) total/);
            if (match) {
                totalTests = parseInt(match[1]);
            }
        }
        else if (line.includes('Lines')) {
            var match = line.match(/Lines\s+:\s+([\d.]+)%/);
            if (match) {
                coveragePercentage = parseFloat(match[1]);
            }
        }
    }
    var coverageText = "".concat(coveragePercentage.toFixed(0), "%");
    console.log("".concat(passedTests, "/").concat(totalTests, " test cases passed. ").concat(coverageText, " line coverage achieved."));
    logger.log({ 'level': 'info', 'message': 'Running tests...' });
}
exports.runTests = runTests;
// Main CLI
var args = process.argv.slice(2);
// Load environment variables from .env file
dotenv.config();
if (process.env.GITHUB_TOKEN === undefined || process.env.GITHUB_TOKEN === '') {
    console.log('Please set the GITHUB_TOKEN environment variable.');
    (0, process_1.exit)(1);
}
var logFile;
if (process.env.LOG_FILE === undefined || process.env.LOG_FILE === '') {
    console.log('Please set the LOG_FILE environment variable.');
    (0, process_1.exit)(1);
}
else {
    logFile = process.env.LOG_FILE;
}
var logLevel = '';
// Set logging level based on LOG_LEVEL environment variable
if (process.env.LOG_LEVEL !== undefined && process.env.LOG_LEVEL !== '') {
    if (process.env.LOG_LEVEL === '0') {
        logLevel = '';
    }
    else if (process.env.LOG_LEVEL === '1') {
        logLevel = 'error';
    }
    else if (process.env.LOG_LEVEL === '2') {
        logLevel = 'info';
    }
}
// Configure logging to LOG_FILE
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        // default log file
        new winston.transports.File({ filename: 'run.log', level: logLevel }),
    ],
});
fs.access(logFile, fs.constants.W_OK, function (err) {
    if (err) {
        // If unable to access, log to a default file
        fs.writeFileSync('run.log', '', { flag: 'w' });
    }
    else {
        logger.remove(new winston.transports.File({ filename: 'run.log', level: logLevel }));
        // Clear LOG_FILE, open with write permissions if it doesn't exist
        logger.add(new winston.transports.File({ filename: logFile, level: logLevel }));
        fs.writeFileSync(logFile, '', { flag: 'w' });
    }
});
exports.default = logger;
// console.log(args)
if (args[0] == 'test') {
    runTests('./jest.log.txt');
}
else if (args[0] == 'b64') {
    // console.log(args[1]);
    console.log({ 'level': 'error', 'message': "No file specified." });
    var packageBuf = Buffer.from(args[1], 'base64');
    // console.log(packageBuf);
    var zip = new JSZip();
    zip.loadAsync(packageBuf)
        .then(function (loadZip) {
        var sourceMetrics = (0, license_ramp_up_metric_1.zip_license_ramp_up_metric)(loadZip);
    })
        .catch(function (error) {
        console.error("Error loading zip file: ".concat(error));
    });
}
else if (args[0] !== undefined) {
    fs.access(args[0], fs.constants.F_OK, function (err) {
        if (err) {
            logger.log({ 'level': 'error', 'message': "File '".concat(args[0], "' does not exist.") });
        }
        else {
            logger.log({ 'level': 'info', 'message': "File '".concat(args[0], "' exists.") });
            processUrls(args[0]);
        }
    });
}
