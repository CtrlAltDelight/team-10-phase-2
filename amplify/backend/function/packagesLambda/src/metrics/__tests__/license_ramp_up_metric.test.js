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
// tests/license_ramp_up_metric.test.ts
const fse = __importStar(require("fs-extra"));
const license_ramp_up_metric_1 = require("../license_ramp_up_metric");
describe('license_ramp_up_metric', () => {
    it('should return an array of metrics with GitHub', async () => {
        const repoURL = 'https://github.com/rpgeeganage/ifto'; // Adjust with a valid URL
        const metrics = await (0, license_ramp_up_metric_1.license_ramp_up_metric)(repoURL);
        // You can add your assertions here to test the behavior
        expect(metrics).toHaveLength(3); // Assuming it returns an array of length 3
        //checks that it is between the right range
        expect(metrics[0]).toBeLessThanOrEqual(1);
        expect(metrics[1]).toBeLessThanOrEqual(1);
        expect(metrics[2]).toBeLessThanOrEqual(1);
        expect(metrics[0]).toBeGreaterThanOrEqual(0);
        expect(metrics[1]).toBeGreaterThanOrEqual(0);
        expect(metrics[2]).toBeGreaterThanOrEqual(0);
        //license score should be 0
        expect(metrics[0]).toEqual(0);
    });
    it('should return an arary of metrics with npmjs URL', async () => {
        const repoURL = 'https://www.npmjs.com/package/helmet';
        const metrics = await (0, license_ramp_up_metric_1.license_ramp_up_metric)(repoURL);
        expect(metrics).toHaveLength(3);
        //checks that it is between the right range
        expect(metrics[0]).toBeLessThanOrEqual(1);
        expect(metrics[1]).toBeLessThanOrEqual(1);
        expect(metrics[2]).toBeLessThanOrEqual(1);
        expect(metrics[0]).toBeGreaterThanOrEqual(0);
        expect(metrics[1]).toBeGreaterThanOrEqual(0);
        expect(metrics[2]).toBeGreaterThanOrEqual(0);
        //license score should be 0
        expect(metrics[0]).toEqual(0);
    });
});
describe('findGitHubRepoUrl', () => {
    it('Return the GitHub url for the fun-memoize Package in NPMJS', async () => {
        var Package = 'fun-memoize';
        var GitHubUrl = await (0, license_ramp_up_metric_1.findGitHubRepoUrl)(Package);
        expect(GitHubUrl).toBe('https://github.com/olegnn/fun-memoize.git');
    });
    it('Return the GitHub url for the Happy Package in NPMJS', async () => {
        var Package = 'happy';
        var GitHubUrl = await (0, license_ramp_up_metric_1.findGitHubRepoUrl)(Package);
        expect(GitHubUrl).toBe('https://github.com/franciscop/happy.git');
    });
    it('Return the GitHub url for the supervisor Package in NPMJS', async () => {
        var Package = 'supervisor';
        var GitHubUrl = await (0, license_ramp_up_metric_1.findGitHubRepoUrl)(Package);
        expect(GitHubUrl).toBe('https://github.com/petruisfan/node-supervisor.git');
    });
});
describe('countWords', () => {
    it('should return 0 for an empty string', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('');
        expect(result).toBe(0);
    });
    it('should return 1 for a single word', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('Hello');
        expect(result).toBe(1);
    });
    it('should count multiple words separated by spaces', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('Hello World');
        expect(result).toBe(2);
    });
    it('should count words separated by tabs', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('Hello\tWorld');
        expect(result).toBe(2);
    });
    it('should count words separated by newlines', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('Hello\nWorld');
        expect(result).toBe(2);
    });
    it('should count words with multiple spaces between them', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('Hello     World');
        expect(result).toBe(2);
    });
    it('should handle leading and trailing spaces', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('  Hello World  ');
        expect(result).toBe(2);
    });
    it('should handle complex text with mixed whitespace characters', () => {
        const result = (0, license_ramp_up_metric_1.countWords)('Hello\t   \n   World');
        expect(result).toBe(2);
    });
});
describe('calculate_ramp_up_metric', () => {
    it('should return 0 when wordCount is 0', () => {
        const wordCount = 0;
        const maxWordCount = 100;
        const result = (0, license_ramp_up_metric_1.calculate_ramp_up_metric)(wordCount, maxWordCount);
        expect(result).toBe(0);
    });
    it('should return 1 when wordCount is equal to maxWordCount', () => {
        const wordCount = 100;
        const maxWordCount = 100;
        const result = (0, license_ramp_up_metric_1.calculate_ramp_up_metric)(wordCount, maxWordCount);
        expect(result).toBe(1);
    });
    it('should return a value between 0 and 1 when wordCount is less than maxWordCount', () => {
        const wordCount = 50;
        const maxWordCount = 100;
        const result = (0, license_ramp_up_metric_1.calculate_ramp_up_metric)(wordCount, maxWordCount);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(1);
    });
    it('should return a value of 1 when wordCount is greater than maxWordCount', () => {
        const wordCount = 150;
        const maxWordCount = 100;
        const result = (0, license_ramp_up_metric_1.calculate_ramp_up_metric)(wordCount, maxWordCount);
        expect(result).toBe(1);
    });
});
describe('findAllFiles', () => {
    // Create a temporary directory for testing
    const testDirectory = 'test-directory';
    beforeAll(() => {
        // Create a temporary directory with some files and subdirectories
        fse.mkdirSync(testDirectory);
        fse.writeFileSync(`${testDirectory}/file1.ts`, 'Some content');
        fse.mkdirSync(`${testDirectory}/subdirectory`);
        fse.writeFileSync(`${testDirectory}/subdirectory/file2.ts`, 'Some content');
        fse.writeFileSync(`${testDirectory}/file3.js`, 'Some content');
    });
    afterAll(() => {
        // Remove the temporary directory after tests
        fse.removeSync(testDirectory);
    });
    it('should find all TypeScript files in a directory', () => {
        const result = (0, license_ramp_up_metric_1.findAllFiles)(testDirectory);
        expect(result).toEqual([
            `${testDirectory}/file1.ts`,
            `${testDirectory}/subdirectory/file2.ts`,
        ]);
        fse.removeSync(testDirectory);
    });
    it('should return an empty array if no TypeScript files are found', () => {
        // Create a directory with non-TypeScript files    
        fse.mkdirSync(testDirectory);
        fse.writeFileSync(`${testDirectory}/file4.js`, 'Some content');
        const result = (0, license_ramp_up_metric_1.findAllFiles)(testDirectory);
        expect(result).toEqual([]);
        // Clean up the non-TypeScript file
        fse.unlinkSync(`${testDirectory}/file4.js`);
    });
});
