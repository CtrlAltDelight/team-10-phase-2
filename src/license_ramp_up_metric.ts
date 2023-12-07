#!/usr/bin/env node
import logger from './run';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import git from 'isomorphic-git'; 
import http from 'isomorphic-git/http/node';
import axios from 'axios';
import * as tmp from 'tmp';
import { Linter, ESLint} from 'eslint'; 
import { join, extname } from 'path'; 

const compatibleLicenses = [
    'mit license', 
    'bsd 2-clause "simplified" license', 
    /(mit.*license|license.*mit)/i,
];

async function cloneRepository(repoUrl: string, localPath: string): Promise<void> { 
  try {
    // Clone the repository
    await git.clone({
      fs,
      http,
      dir: localPath,
      url: repoUrl,
    });

    //console.log('Repository cloned successfully.');

  } catch (error) {
    logger.log({'level': 'error', 'message': `${error}`});
  }
}


export async function findGitHubRepoUrl(packageName: string): Promise<string> {
  try {
    // Fetch package metadata from the npm registry
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`);

    if (response.status !== 200) {
      logger.log({'level': 'error', 'message': `Failed to fetch package metadata for ${packageName}`});
      return 'none';
    }

    // Parse the response JSON
    const packageMetadata = response.data;

    //console.log(packageMetadata.repository);
    //console.log(packageMetadata.repository.url);
    // Check if the "repository" field exists in the package.json
    if (packageMetadata.repository && packageMetadata.repository.url) {
      return 'https://' + packageMetadata.repository.url.match(/github\.com\/[^/]+\/[^/]+(?=\.git|$)/);
    } else {
      logger.log({'level': 'error', 'message': `No repository URL found for ${packageName}`});
      return 'none';
    }
  } catch (error) {
    logger.log({'level': 'error', 'message': `${error}`});
    return 'none';
  }
} 

// Function to count words in a string
export function countWords(text: string): number {
  const words = text.split(/\s+/);
  const nonEmptyWords = words.filter(word => word !== ''); 
  return nonEmptyWords.length;
}

// Function to calculate the score based on word count
export function calculate_ramp_up_metric(wordCount: number, maxWordCount: number): number {
  const maxScore = 1.0; // Maximum score
    
  // Calculate the score based on the word count relative to the max word count
  return Math.min(wordCount / maxWordCount, maxScore); 
}

export function findAllFiles(directory: string): string[] {
  const allFiles: string[] = []; 
  const codeExtensions = ['.ts']; //NEED TP MAKE THIS WORK FOR ALL DIFFERENT TYPES OF FILES BUT RIGHT NOW IT ONLY GOES THROUGH .TS FILES
  
  function traverseDirectory(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const filePath = join(currentDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDirectory(filePath);
      } else if (codeExtensions.includes(extname(filePath))) {
        allFiles.push(filePath);
      }
    }
  }

  traverseDirectory(directory);
  return allFiles; 
}

export async function calculate_correctness_metric(filepath: string): Promise<number> {
  try {
    // Initailize ESLint
    const eslint = new ESLint(); 

    //Get a list of Typescript files with the cloned directory
    const allFiles = findAllFiles(filepath); 

    //Lint in Typescript files
    const results = eslint.lintFiles(allFiles); 

    // Calculate the total number of issues (errors + warnings)
    let totalIssues = 0; 
    for (const result of await results) 
    {
      totalIssues += result.errorCount + result.warningCount; 
    }

    // Calculate the lint score as a value between 0 and 1
    const lintScore = 1 - Math.min(1, totalIssues / 1000.0);

    return lintScore;
  } catch (error) {
    //console.error('Error running ESLint:', error);
    return 0; // Return 0 in case of an error
  }
}

export async function license_ramp_up_metric(repoURL: string): Promise<number[]> {
    const tempDir = tmp.dirSync(); //makes a temporary directory
    const repoDir = tempDir.name; 
    let license_met = 0;
    let ramp_up_met = 0;  
    let correctness_met = 0; 
    //looks into tmpdir to make a temporay directory and then deleting at the end of the function 
    //console.log(repoDir);
    fse.ensureDir(repoDir); //will make sure the directory exists or will create a new one
    
    //check the URL to see if it is a github url or a npmjs url 
    const url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
    const parts = url.split('/'); 
    if(parts[0] === 'npmjs.com') {
      //console.log("This is a npmjs url");
      //finds the github url of the npmjs module
      //console.log(`This is the npmjs package ${parts[2]}`);
      repoURL = await findGitHubRepoUrl(parts[2]);
      if(repoURL == null) {
        //console.log(`This npmjs is not stored in a github repository.`);
        return [license_met, ramp_up_met, correctness_met]; 
      }
    }
    //console.log(repoURL);

    //probably need to add in something to check if the url is from github just to make sure 
    
    await cloneRepository(repoURL, repoDir); //clones the repository

    //Reads in the cloned repository
    let readmePath = `${repoDir}/Readme.md`; 
    let readmeContent = 'none';
    if(fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
    } else {
      readmePath = `${repoDir}/readme.markdown`; 
      if(fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
      } 
    }

    //CALCULATES THE LICENSE SCORE 
    for(const compatibleLicense of compatibleLicenses) {
      if(readmeContent.match(compatibleLicense)) {
        license_met = 1; //License found was compatible 
      }
    }

    //CALCULATES THE RAMPUP SCORE 
    const wordCount = countWords(readmeContent); //gets the number of words in the README
    const maxWordCount = 2000; //NEED TO ADJUST THIS NUMBER BASED ON WHAT WE GET FROM DIFFERENT TEST RESULTS
    ramp_up_met = calculate_ramp_up_metric(wordCount, maxWordCount); //calculates the actual score


    //CALUCLATES THE CORRECTNESS SCORE
    correctness_met =  await calculate_correctness_metric(repoDir); 


    //deletes the temporary directory that was made
    try {
      fse.removeSync(repoDir); 
      //console.log('Temporary directory deleted.');
    } catch (err) {
      logger.log({'level': 'error', 'message': `${err}`});
    }


    return([license_met, ramp_up_met, correctness_met]); 
}