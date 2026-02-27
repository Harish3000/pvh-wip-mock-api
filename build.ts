import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

const srcDir = path.join(__dirname, 'src', 'contracts');
const outDir = path.join(__dirname, 'public');

// Helper to get true file modified time from Git (Fallback to fs.stat)
function getTrueFileTime(filePath: string): Date {
  try {
    const gitTime = execSync(`git log -1 --format="%cd" --date=iso -- "${filePath}"`, { stdio: 'pipe' }).toString().trim();
    if (gitTime) return new Date(gitTime);
  } catch (e) {
    // Git not available or file not committed yet, fallback to FS time
  }
  return fs.statSync(filePath).mtime;
}

async function build() {
  await fs.emptyDir(outDir);
  const buildTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
  
  // 1. Output the Plan JSON
  const { planData } = require('./src/plan.ts');
  await fs.outputJson(path.join(outDir, 'plan.json'), { _metadata: { lastUpdated: buildTime }, payload: planData }, { spaces: 2 });

  let contracts =[];

  // 2. Read and Sort Contracts by True Last Modified Date
  if (await fs.pathExists(srcDir)) {
    const files = await fs.readdir(srcDir);
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(srcDir, file);
        const trueTime = getTrueFileTime(filePath);
        const baseName = file.replace('.ts', '');
        const module = require(filePath);
        
        if (module.mockData) {
          contracts.push({
            file,
            baseName,
            data: module.mockData,
            mtime: trueTime,
            updatedStr: trueTime.toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' })
          });
        }
        // Copy raw TS file so it can be fetched by the browser
        await fs.copy(filePath, path.join(outDir, 'contracts', file));
      }
    }
  }

  // Sort newest first
  contracts.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  let contractLinksHTML = '';
  for (const c of contracts) {
    // Write clean JSON to the root of public (e.g., /nexus-raw.json)
    const wrappedData = { _metadata: { lastUpdated: c.updatedStr, source: c.file }, payload: c.data };
    await fs.outputJson(path.join(outDir, `${c.baseName}.json`), wrappedData, { spaces: 2 });

    contractLinksHTML += `
      <div class="group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 mb-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Info Section -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-lg font-bold text-slate-900 truncate">${c.baseName}</h3>
              <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200 whitespace-nowrap">
                <svg class="mr-1.5 h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Updated: ${c.updatedStr}
              </span>
            </div>
            <p class="text-sm text-slate-500 flex items-center gap-1.5 truncate">
              <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              src/contracts/${c.file}
            </p>
          </div>
          <!-- Buttons Section -->
          <div class="flex flex-row items-center gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
            <!-- Copies the Actual TypeScript Code -->
            <button onclick="copyContractCode('/contracts/${c.file}', '${c.file}')" class="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all">
              <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Copy Contract
            </button>
            <!-- Copies the JSON API URL -->
            <button onclick="copyApiUrl('/${c.baseName}.json', '${c.baseName}.json')" class="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 transition-all">
              <svg class="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Copy URL
            </button>
          </div>
        </div>
      </div>`;
  }

  // 3. Generate the UI (Tailwind CSS) - Removed Producer/Consumer column
  let rolesHTML = planData.roles.map((r: any) => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td class="p-4 font-semibold text-slate-900">${r.dev}</td>
      <td class="p-4 text-slate-600">${r.role}</td>
      <td class="p-4"><span class="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono text-slate-700">${r.contract}.ts</span></td>
    </tr>`).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PVH WIP - Developer Portal</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <!-- Professional Code/API Favicon -->
      <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='16 18 22 12 16 6'/%3E%3Cpolyline points='8 6 2 12 8 18'/%3E%3C/svg%3E">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: { fontFamily: { sans:['Inter', 'sans-serif'] } }
          }
        }
      </script>
    </head>
    <body class="bg-slate-50 p-4 md:p-8 font-sans antialiased text-slate-900">
      
      <!-- Toast Notification -->
      <div id="toast" class="fixed bottom-5 right-5 transform translate-y-20 opacity-0 transition-all duration-300 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center z-50 border border-slate-700">
        <svg class="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span id="toast-msg" class="font-medium text-sm">Copied!</span>
      </div>

      <div class="max-w-5xl mx-auto">
        
        <!-- Header -->
        <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">PVH WIP Integration</h1>
              <p class="text-slate-500 font-medium mt-1">Mock Server</p>
            </div>
          </div>
          <div class="mt-5 md:mt-0 flex flex-col items-start md:items-end">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 rounded-full text-xs font-bold shadow-sm mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
            </span>
            <p class="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Build: ${buildTime}
            </p>
          </div>
        </header>

        <!-- Main Content Stack -->
        <div class="flex flex-col gap-10">
          
          <!-- Top Section: Contracts -->
          <section>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
              <h2 class="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                <svg class="w-5 h-5 mr-2.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Available API Contracts
              </h2>
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">Sorted by Newest</span>
            </div>
            ${contractLinksHTML || '<div class="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center"><p class="text-slate-500 font-medium">No contracts defined yet.</p></div>'}
          </section>

          <!-- Bottom Section: Team Roster (Full Width) -->
          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-6 flex items-center tracking-tight">
              <svg class="w-5 h-5 mr-2.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Team Responsibilities
            </h2>
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm whitespace-nowrap">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Developer</th>
                      <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Domain</th>
                      <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contract</th>
                    </tr>
                  </thead>
                  <tbody>${rolesHTML}</tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      </div>

      <script>
        const getBaseUrl = () => window.location.origin + window.location.pathname.replace(/\\/index\\.html$/, '').replace(/\\/$/, '');

        function showToast(message) {
          const toast = document.getElementById('toast');
          document.getElementById('toast-msg').innerText = message;
          toast.classList.remove('translate-y-20', 'opacity-0');
          setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
        }

        // Copies the actual code from the TS file
        async function copyContractCode(path, filename) {
          try {
            const res = await fetch(getBaseUrl() + path);
            if (!res.ok) throw new Error('Network response was not ok');
            const text = await res.text();
            await navigator.clipboard.writeText(text);
            showToast('Code copied: ' + filename);
          } catch (err) {
            alert('Failed to fetch and copy contract code.');
            console.error(err);
          }
        }

        // Copies the JSON URL string
        function copyApiUrl(path, filename) {
          const fullUrl = getBaseUrl() + path;
          navigator.clipboard.writeText(fullUrl).then(() => {
            showToast('URL copied: ' + filename);
          }).catch(err => {
            alert('Failed to copy URL');
          });
        }
      </script>
    </body>
    </html>`;
  await fs.outputFile(path.join(outDir, 'index.html'), html);
  console.log('Build complete! UI and JSON API generated.');
}
build().catch((err) => {
  console.error("BUILD FAILED:", err);
  process.exit(1); 
});