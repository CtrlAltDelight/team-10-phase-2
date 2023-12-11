import JSZip = require("jszip");
import { findGitHubRepoUrl } from "./license_ramp_up_metric";

// takes in NPM or git url, returns [url, owner, repo]
export async function gitifyURL(repoURL: string): Promise<string[] | null>  {
    let url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
    let sections = url.split('/');
    if (sections[0] === 'npmjs.com') {
        console.log({'level': 'info', 'message': `npmjs package: ${sections[2]}`});
        // Find the GitHub URL for the package
        repoURL = await findGitHubRepoUrl(sections[2]);
        if (repoURL === 'none') {
            console.log({'level': 'error', 'message': 'This npmjs package is not stored in a GitHub repository.'});
            return null;
        }
    // Get owner and repo from GitHub URL
    url = repoURL.replace(/^(https?:\/\/)?(www\.)?/i, '');
    sections = url.split('/');
    sections[2] = sections[2].replace(/\.git$/i, '');
    }

    // Check if the URL is a valid GitHub repository URL
    if (!repoURL.match(/^(https:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+$/i)) {
        console.log({'level': 'error', 'message': `Invalid GitHub repository URL: ${repoURL}`});
        return null;
    }

    console.log({'level': 'info', 'message': `GitHub URL: ${repoURL}`});
    console.log({'level': 'info', 'message': `GitHub owner: ${sections[1]}, GitHub repo: ${sections[2]}`});
    return [url, sections[1], sections[2]]; 
  }
