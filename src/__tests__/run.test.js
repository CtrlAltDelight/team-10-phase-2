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
const fse = require("fs-extra");
const run_1 = require("../run"); // Import the functions you want to test
describe('processUrls', () => {
    const testDirectory = 'test-directory';
    beforeAll(() => {
        fse.mkdirSync(testDirectory);
    });
    afterAll(() => {
        fse.removeSync(testDirectory);
    });
    it('should call console.log 2 times', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a spy on console.log
        fse.writeFileSync(`${testDirectory}/sampleUrlFile.txt`, 'https://www.example.com\nhttps://www.anotherexample.com');
        const consoleLogSpy = jest.spyOn(global.console, 'log');
        // Mock the behavior of license_ramp_up_metric and bus_factor_maintainer_metric
        const mockLicenseRampUpMetric = jest.fn().mockResolvedValue([0.5, 0.8, 0.9]);
        const mockBusFactorMaintainerMetric = jest.fn().mockResolvedValue([0.2, 0.6]);
        // Replace the real implementations with the mocks
        jest.mock('../license_ramp_up_metric', () => ({
            license_ramp_up_metric: mockLicenseRampUpMetric,
        }));
        jest.mock('../bus_factor_maintainer_metric', () => ({
            bus_factor_maintainer_metric: mockBusFactorMaintainerMetric,
        }));
        // Call your function that logs the JSON message
        yield (0, run_1.processUrls)(`${testDirectory}/sampleUrlFile.txt`);
        // Check if console.log was called with the expected JSON string
        expect(consoleLogSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        // Clean up the spy
        consoleLogSpy.mockRestore();
    }));
    it('should not call console.log at all', () => __awaiter(void 0, void 0, void 0, function* () {
        fse.writeFileSync(`${testDirectory}/sampleUrlFile.txt`, '');
        const consoleLogSpy = jest.spyOn(global.console, 'log');
        yield (0, run_1.processUrls)(`${testDirectory}/sampleUrlFile.txt`);
        expect(consoleLogSpy).toHaveBeenCalledTimes(0);
        // Clean up the spy
        consoleLogSpy.mockRestore();
    }));
});
describe('runTests', () => {
    const testDirectory = 'test-directory';
    beforeAll(() => {
        fse.mkdirSync(testDirectory);
    });
    afterAll(() => {
        fse.removeSync(testDirectory);
    });
    it('should call console.log 4 times', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a spy on console.log
        fse.writeFileSync(`${testDirectory}/sampleTestFile.txt`, 'Tests:      30 passed, 128 total\nLines: 20.00% \n lagrhurhgr\nlkdngt');
        const consoleLogSpy = jest.spyOn(global.console, 'log');
        // Call your function that logs the JSON message
        yield (0, run_1.runTests)(`${testDirectory}/sampleTestFile.txt`);
        // Check if console.log was called with the expected JSON string
        expect(consoleLogSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        // Clean up the spy
        consoleLogSpy.mockRestore();
    }));
    it('should not call console.log at all', () => __awaiter(void 0, void 0, void 0, function* () {
        fse.writeFileSync(`${testDirectory}/sampleUrlFile.txt`, '');
        const consoleLogSpy = jest.spyOn(global.console, 'log');
        yield (0, run_1.processUrls)(`${testDirectory}/sampleUrlFile.txt`);
        expect(consoleLogSpy).toHaveBeenCalledTimes(0);
        consoleLogSpy.mockRestore();
    }));
});
