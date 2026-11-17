/**
 * tools/generate-contributors.js
 * Automatically fetches contributors from GitHub API:
 * https://api.github.com/repos/mpc-ou/mpc2026.exe/contributors
 * Falls back to local git log if offline or rate-limited.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const REPO_OWNER = 'mpc-ou';
const REPO_NAME = 'mpc2026.exe';
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'data', 'contributors.json');

const KNOWN_ROLES = {
  'pgiahuy': {
    name: 'Phan Gia Huy',
    role: 'Lead Architect & Developer'
  },
  'konnn04': {
    name: 'Nguyễn Thanh Triều',
    role: 'Trưởng Ban Lập Trình (BLT)'
  }
};

function fetchJson(url, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'MPClub-Contributors-Sync/1.0',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchFromGitHubApi(token) {
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors`;
  console.log(`[Contributors Generator] Fetching from GitHub API: ${apiUrl}`);

  const contributors = await fetchJson(apiUrl, token);
  if (!Array.isArray(contributors)) {
    throw new Error('API response is not an array');
  }

  const result = [];
  for (const c of contributors) {
    let displayName = c.login;
    let role = 'Contributor';

    const known = KNOWN_ROLES[c.login.toLowerCase()];
    if (known) {
      displayName = known.name;
      role = known.role;
    } else {
      // Attempt to fetch profile for real name
      try {
        const userProfile = await fetchJson(`https://api.github.com/users/${c.login}`, token);
        if (userProfile && userProfile.name) {
          displayName = userProfile.name;
        }
      } catch (err) {
        // use login
      }
    }

    result.push({
      name: displayName,
      username: c.login,
      avatar: c.avatar_url,
      commits: c.contributions,
      role: role,
      profile: c.html_url || `https://github.com/${c.login}`
    });
  }

  return result;
}

function fetchFromLocalGitLog() {
  console.log('[Contributors Generator] Falling back to local git log...');
  const map = new Map();

  try {
    const raw = execSync('git shortlog -sne --all', { encoding: 'utf-8' });
    const lines = raw.trim().split('\n');

    for (const line of lines) {
      const match = line.trim().match(/^(\d+)\s+([^<]+)<([^>]+)>/);
      if (match) {
        const count = parseInt(match[1], 10);
        const name = match[2].trim();
        const email = match[3].trim().toLowerCase();

        let username = name.toLowerCase().replace(/\s+/g, '');
        if (email.includes('pgiahuy') || name.toLowerCase().includes('gia huy')) {
          username = 'pgiahuy';
        } else if (email.includes('trieu') || email.includes('konnn')) {
          username = 'konnn04';
        }

        const prev = map.get(username) || { count: 0, name, username };
        prev.count += count;
        map.set(username, prev);
      }
    }
  } catch (err) {
    console.warn('[Contributors Generator] Local git command error:', err.message);
  }

  const result = [];
  for (const [username, data] of map.entries()) {
    const known = KNOWN_ROLES[username] || {};
    result.push({
      name: known.name || data.name,
      username: username,
      avatar: `https://github.com/${username}.png`,
      commits: data.count,
      role: known.role || 'Contributor',
      profile: `https://github.com/${username}`
    });
  }

  return result;
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  let contributors = [];

  try {
    contributors = await fetchFromGitHubApi(token);
    console.log(`[Contributors Generator] Fetched ${contributors.length} contributors from GitHub API.`);
  } catch (err) {
    console.warn(`[Contributors Generator] GitHub API fetch failed: ${err.message}`);
    contributors = fetchFromLocalGitLog();
  }

  // Final fallback if empty
  if (!contributors || contributors.length === 0) {
    contributors = [
      {
        name: 'Phan Gia Huy',
        username: 'pgiahuy',
        avatar: 'https://avatars.githubusercontent.com/u/152808787?v=4',
        commits: 6,
        role: 'Lead Architect & Developer',
        profile: 'https://github.com/pgiahuy'
      },
      {
        name: 'Nguyễn Thanh Triều',
        username: 'konnn04',
        avatar: 'https://avatars.githubusercontent.com/u/85620049?v=4',
        commits: 1,
        role: 'Trưởng Ban Lập Trình (BLT)',
        profile: 'https://github.com/konnn04'
      }
    ];
  }

  // Sort by contributions descending
  contributors.sort((a, b) => b.commits - a.commits);

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(contributors, null, 2), 'utf-8');
  console.log(`[Contributors Generator] Saved ${contributors.length} contributors to: ${OUTPUT_PATH}`);
}

main();
