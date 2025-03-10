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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.runTests = exports.processUrls = void 0;
const fs = __importStar(require("fs"));
const license_ramp_up_metric_1 = require("./license_ramp_up_metric");
const bus_factor_maintainer_metric_1 = require("./bus_factor_maintainer_metric");
const dotenv = __importStar(require("dotenv"));
// import * as winston from 'winston';
const process_1 = require("process");
const JSZip = require("jszip");
// Function to process URL_FILE and produce NDJSON output
async function processUrls(urlFile) {
    // try {
    //   const filePath = urlFile; // Replace with the path to your file
    //   const fileContents = fs.readFileSync(filePath, 'utf-8');
    //   // Split the file contents into individual URLs based on new lines
    //   const urls = fileContents.split('\n').filter(url => url.trim() !== '');
    //   // Now you have an array of URLs, and you can work with them as needed
    //   //console.log(urls);
    //   let l_r_metric_array: number[]; //[0] = License Score, [1] = Ramp Up Score, [2] = Correctness Score
    //   let bf_rm_metric_array: number[]; //[0] = Bus Factor Score, [1] = Responsive Maintainer Score
    //   // let number = 0;
    //   let net_score = 0;
    //   for(const url of urls) {
    //     logger.log({'level': 'info', 'message': `The URL that is currently running is ${url}`});
    //     l_r_metric_array = await license_ramp_up_metric(url); //returns license metric first and then ramp up metric
    //     logger.log({'level': 'info', 'message': `The license metric is ${l_r_metric_array[0]}`});
    //     logger.log({'level': 'info', 'message': `The ramp up metric is ${l_r_metric_array[1]}`});
    //     logger.log({'level': 'info', 'message': `The correctness metric is ${l_r_metric_array[2]}`});
    //     bf_rm_metric_array = await bus_factor_maintainer_metric(url);
    //     logger.log({'level': 'info', 'message': `The bus factor metric is ${bf_rm_metric_array[0]}`});
    //     logger.log({'level': 'info', 'message': `The responsive maintainer metric is ${bf_rm_metric_array[1]}`});
    //     logger.log({'level': 'info', 'message': `The dependency metric is ${bf_rm_metric_array[2]}`});
    //     logger.log({'level': 'info', 'message': `The code_review metric is ${bf_rm_metric_array[3]}`});
    //     // Calculate net score: (0.35 * correctness + 0.25 * maintainer + 0.2 * bus factor + 0.2 * ramp up) * license
    //     net_score = (0.35 * l_r_metric_array[2] + 0.25 * bf_rm_metric_array[1] + 0.2 * bf_rm_metric_array[0] + 0.2 * l_r_metric_array[1]) * l_r_metric_array[0];
    //     console.log(`{"URL":"${url}", "NET_SCORE":${net_score.toFixed(5)}, "RAMP_UP_SCORE":${l_r_metric_array[1].toFixed(5)}, "CORRECTNESS_SCORE":${l_r_metric_array[2].toFixed(5)}, "BUS_FACTOR_SCORE":${bf_rm_metric_array[0].toFixed(5)}, "RESPONSIVE_MAINTAINER_SCORE":${bf_rm_metric_array[1].toFixed(5)}, "LICENSE_SCORE":${l_r_metric_array[0].toFixed(5)}}`);
    //     console.log(`NEW METRIC! Dependencies-score: ${bf_rm_metric_array[2]}, CodeReview-score: ${bf_rm_metric_array[3]}\n`);
    //   }
    // } catch (err) {
    //   logger.log({'level': 'error', 'message': `${err}`});
    // }
}
exports.processUrls = processUrls;
// Function to run the test suite
function runTests(file) {
    //Parsing the output from Jest here 
    const text = fs.readFileSync(file, 'utf-8');
    const lines = text.split('\n');
    let totalTests = 0;
    let passedTests = 0;
    let coveragePercentage = 0;
    for (const line of lines) {
        if (line.includes('Tests: ')) {
            let match = line.match(/(\d+) passed/);
            if (match) {
                passedTests = parseInt(match[1]);
            }
            match = line.match(/(\d+) total/);
            if (match) {
                totalTests = parseInt(match[1]);
            }
        }
        else if (line.includes('Lines')) {
            const match = line.match(/Lines\s+:\s+([\d.]+)%/);
            if (match) {
                coveragePercentage = parseFloat(match[1]);
            }
        }
    }
    const coverageText = `${coveragePercentage.toFixed(0)}%`;
    console.log(`${passedTests}/${totalTests} test cases passed. ${coverageText} line coverage achieved.`);
    console.log({ 'level': 'info', 'message': 'Running tests...' });
}
exports.runTests = runTests;
// Main CLI
const args = process.argv.slice(2);
// Load environment variables from .env file
dotenv.config();
if (process.env.GITHUB_TOKEN === undefined || process.env.GITHUB_TOKEN === '') {
    console.log('Please set the GITHUB_TOKEN environment variable.');
    (0, process_1.exit)(1);
}
let logFile;
if (process.env.LOG_FILE === undefined || process.env.LOG_FILE === '') {
    console.log('Please set the LOG_FILE environment variable.');
    (0, process_1.exit)(1);
}
else {
    logFile = process.env.LOG_FILE;
}
let logLevel = '';
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
// // Configure logging to LOG_FILE
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.simple(),
//   transports: [
//     // default log file
//     new winston.transports.File({ filename: '/tmp/run.log', level: logLevel }),
//   ],
// });
// fs.access(logFile, fs.constants.W_OK, (err) => {
//   if (err) {
//     // If unable to access, log to a default file
//     fs.writeFileSync('/tmp/run.log', '', { flag: 'w' });
//   } else {
//     logger.remove(new winston.transports.File({ filename: '/tmp/run.log', level: logLevel }));
//     // Clear LOG_FILE, open with write permissions if it doesn't exist
//     logger.add(new winston.transports.File({ filename: logFile, level: logLevel }));
//     fs.writeFileSync(logFile, '', { flag: 'w' });
//   }
// });
// export default logger;
if (args[0] == 'test') {
    runTests('./jest.log.txt');
}
else if (args[0] == 'b64') {
    // console.log(args[1]);
    console.log({ 'level': 'error', 'message': `No file specified.` });
    const packageBuf = Buffer.from(args[1], 'base64');
    const zip = new JSZip();
    zip.loadAsync(packageBuf)
        .then(loadZip => {
        const sourceMetrics = (0, license_ramp_up_metric_1.zip_license_ramp_up_metric)(loadZip);
        console.log(sourceMetrics);
    })
        .catch(error => {
        console.error(`Error loading zip file: ${error}`);
    });
}
else if (args[0] == 'url') {
    // let bf_rm_metric_array = await 
    (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(args[1])
        .then(bf_rm_metric_array => {
        // Use bf_rm_metric_array here
        console.log(bf_rm_metric_array);
    })
        .catch(error => {
        console.error(`Error: ${error}`);
    });
}
else if (args[0] !== undefined) {
    fs.access(args[0], fs.constants.F_OK, (err) => {
        if (err) {
            console.log({ 'level': 'error', 'message': `File '${args[0]}' does not exist.` });
        }
        else {
            console.log({ 'level': 'info', 'message': `File '${args[0]}' exists.` });
            processUrls(args[0]);
        }
    });
}
async function run(args) {
    if (args.url) {
        let urlMetrics = await (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(args.url);
        return urlMetrics;
    }
    else if (args.b64) {
        const packageBuf = Buffer.from(args.b64, 'base64');
        const zip = new JSZip();
        zip.loadAsync(packageBuf)
            .then(loadZip => {
            const sourceMetrics = (0, license_ramp_up_metric_1.zip_license_ramp_up_metric)(loadZip);
            return sourceMetrics;
        })
            .catch(error => {
            console.error(`Error loading zip file: ${error}`);
        });
    }
}
exports.run = run;
