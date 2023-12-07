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
const bus_factor_maintainer_metric_1 = require("../bus_factor_maintainer_metric");
const bus_factor_maintainer_metric_2 = require("../bus_factor_maintainer_metric");
describe('fetchResponse', () => {
    /*
    it('should send REST API query and fetch response successfully', async () => {
      // Mock the fetch function to always return a 200 status
      const mockResponseData = [{ login: 'contributor1', contributions: 20 }];
      jest.spyOn(global, 'fetch').mockResolvedValue({
        status: 200,
        json: async () => mockResponseData,
      } as Response);
    
      // Call the function
      const contributors = await fetchResponse('https://example.com/api/contributors');
    
      // Assert that the contributors match the expected data
      expect(contributors.json()).toEqual(mockResponseData);
    });
    */
    it('should handle fetch error', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mocking fetch function to simulate an error
        global.fetch = jest.fn(() => Promise.reject('Network error'));
        const contributors = yield (0, bus_factor_maintainer_metric_2.fetchResponse)('https://example.com/api/contributors').catch((error) => {
            return null;
        });
        // Assert that contributors is null in case of error
        expect(contributors).toBeNull();
    }));
});
describe('calcBusFactor', () => {
    it('should calculate bus factor correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const owner = "cloudinary";
        const repo = "cloudinary_npm";
        const busFactor = yield (0, bus_factor_maintainer_metric_2.calcBusFactor)(owner, repo);
        // Update the expected value and precision as needed
        // expect(busFactor).toBeCloseTo(0.1, 1); // Approximately 0.2, rounded to 1 decimal place
        expect(busFactor).toBeLessThanOrEqual(1);
        expect(busFactor).toBeGreaterThanOrEqual(0);
    }));
});
describe('calcResponsiveMaintainer', () => {
    it('should calculate responsive maintainer correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const owner = "cloudinary";
        const repo = "cloudinary_npm";
        const responsiveMaintainer = yield (0, bus_factor_maintainer_metric_2.calcResponsiveMaintainer)(owner, repo);
        // expect(responsiveMaintainer).toBeCloseTo(0.5, 1); // Approximately 0.5, rounded to 1 decimal place
        expect(responsiveMaintainer).toBeLessThanOrEqual(1);
        expect(responsiveMaintainer).toBeGreaterThanOrEqual(0);
    }));
});
describe('bus_factor_maintainer_metric', () => {
    it('should return an array of metrics with GitHub Url', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoURL = 'https://github.com/rpgeeganage/ifto'; // Adjust with a valid URL
        const metrics = yield (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(repoURL);
        // You can add your assertions here to test the behavior
        expect(metrics).toHaveLength(2); // Assuming it returns an array of length 2
        //checks that it is between the right range
        expect(metrics[0]).toBeLessThanOrEqual(1);
        expect(metrics[1]).toBeLessThanOrEqual(1);
        expect(metrics[0]).toBeGreaterThanOrEqual(0);
        expect(metrics[1]).toBeGreaterThanOrEqual(0);
    }));
    it('should return an arary of metrics with npmjs URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoURL = 'https://www.npmjs.com/package/helmet';
        const metrics = yield (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(repoURL);
        expect(metrics).toHaveLength(2);
        //checks that it is between the right range
        expect(metrics[0]).toBeLessThanOrEqual(1);
        expect(metrics[1]).toBeLessThanOrEqual(1);
        expect(metrics[0]).toBeGreaterThanOrEqual(0);
        expect(metrics[1]).toBeGreaterThanOrEqual(0);
    }));
    it('should return an array of 0s with invalid URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoURL = 'https://www.google.com';
        const metrics = yield (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(repoURL);
        expect(metrics).toHaveLength(2);
        expect(metrics[0]).toBe(0);
        expect(metrics[1]).toBe(0);
    }));
    it('should return an array of 0s with invalid GitHub URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoURL = 'https://www.github.com/maxmichalec/invalid';
        const metrics = yield (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(repoURL);
        expect(metrics).toHaveLength(2);
        expect(metrics[0]).toBe(0);
        expect(metrics[1]).toBe(0);
    }));
    it('should return an array of 0s with invalid npmjs URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoURL = 'https://www.npmjs.com/package/thispackagedoesnotexist';
        const metrics = yield (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(repoURL);
        expect(metrics).toHaveLength(2);
        expect(metrics[0]).toBe(0);
        expect(metrics[1]).toBe(0);
    }));
    it('should return an array of 0s with private GitHub repository', () => __awaiter(void 0, void 0, void 0, function* () {
        const repoURL = 'https://github.com/maxmichalec/ece264';
        const metrics = yield (0, bus_factor_maintainer_metric_1.bus_factor_maintainer_metric)(repoURL);
        expect(metrics).toHaveLength(2);
        expect(metrics[0]).toBe(0);
        expect(metrics[1]).toBe(0);
    }));
});
