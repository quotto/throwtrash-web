const fs = require('fs');
const path = require('path');

const branch = process.env.CF_PAGES_BRANCH || process.env.GITHUB_REF_NAME || '';
const isProd = branch === 'deploy';

const env = isProd
  ? {
      NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST_PROD || '',
      NEXT_PUBLIC_API_STAGE: process.env.NEXT_PUBLIC_API_STAGE_PROD || ''
    }
  : {
      NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST_PREVIEW || '',
      NEXT_PUBLIC_API_STAGE: process.env.NEXT_PUBLIC_API_STAGE_PREVIEW || ''
    };

const lines = Object.entries(env)
  .filter(([, v]) => v !== '')
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');

const outfile = path.join(__dirname, '..', 'frontend', '.env.local');
fs.writeFileSync(outfile, lines + '\n');
console.log(`[gen-env] branch=${branch} isProd=${isProd} -> wrote .env.local`);
