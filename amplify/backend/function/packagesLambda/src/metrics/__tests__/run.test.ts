import * as fse from 'fs-extra';
import { processUrls, runTests } from '../run'; // Import the functions you want to test

describe('processUrls', () => {
    const testDirectory = 'test-directory'; 

    beforeAll(() => {
        fse.mkdirSync(testDirectory); 
    }); 

    afterAll(() => {
        fse.removeSync(testDirectory); 
    }); 

    it('should call console.log 2 times', async () => {
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
    await processUrls(`${testDirectory}/sampleUrlFile.txt`);

    
    // Check if console.log was called with the expected JSON string
    expect(consoleLogSpy).toHaveBeenCalled(); 
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);

    // Clean up the spy
    consoleLogSpy.mockRestore();
  });

  it('should not call console.log at all', async () => {
    fse.writeFileSync(`${testDirectory}/sampleUrlFile.txt`, ''); 
    const consoleLogSpy = jest.spyOn(global.console, 'log'); 

    await processUrls(`${testDirectory}/sampleUrlFile.txt`);

    expect(consoleLogSpy).toHaveBeenCalledTimes(0); 
    // Clean up the spy
    consoleLogSpy.mockRestore();
  });
});

describe('runTests', () => {
    const testDirectory = 'test-directory'; 

    beforeAll(() => {
        fse.mkdirSync(testDirectory); 
    }); 

    afterAll(() => {
        fse.removeSync(testDirectory); 
    }); 

    it('should call console.log 4 times', async () => {
    // Create a spy on console.log
    fse.writeFileSync(`${testDirectory}/sampleTestFile.txt`, 'Tests:      30 passed, 128 total\nLines: 20.00% \n lagrhurhgr\nlkdngt'); 
    const consoleLogSpy = jest.spyOn(global.console, 'log');

    // Call your function that logs the JSON message
    await runTests(`${testDirectory}/sampleTestFile.txt`);
    
    // Check if console.log was called with the expected JSON string
    expect(consoleLogSpy).toHaveBeenCalled(); 
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    // Clean up the spy
    consoleLogSpy.mockRestore();
  });

  it('should not call console.log at all', async () => {
    fse.writeFileSync(`${testDirectory}/sampleUrlFile.txt`, ''); 
    const consoleLogSpy = jest.spyOn(global.console, 'log'); 

    await processUrls(`${testDirectory}/sampleUrlFile.txt`);

    expect(consoleLogSpy).toHaveBeenCalledTimes(0); 
    consoleLogSpy.mockRestore(); 
  });
});