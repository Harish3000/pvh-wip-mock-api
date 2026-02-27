import * as fs from 'fs-extra';
import * as path from 'path';

const srcDir = path.join(__dirname, 'src', 'contracts');
const outDir = path.join(__dirname, 'public');

async function build() {
  await fs.emptyDir(outDir);
  const buildTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
  
  // 1. Output the Plan JSON
  const { planData } = require('./src/plan.ts');
  await fs.outputJson(path.join(outDir, 'plan.json'), { _metadata: { lastUpdated: buildTime }, payload: planData }, { spaces: 2 });

  let contracts =[];

  // 2. Read and Sort Contracts by Last Modified Date
  if (await fs.pathExists(srcDir)) {
    const files = await fs.readdir(srcDir);
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(srcDir, file);
        const stats = await fs.stat(filePath);
        const baseName = file.replace('.ts', '');
        const module = require(filePath);
        
        if (module.mockData) {
          contracts.push({
            file,
            baseName,
            data: module.mockData,
            mtime: stats.mtime,
            updatedStr: stats.mtime.toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' })
          });
        }
        // Copy raw TS file for viewing
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
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 hover:shadow-md transition">
        <div class="mb-4 md:mb-0">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            ${c.baseName}
            <span class="ml-3 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-normal border">Updated: ${c.updatedStr}</span>
          </h3>
          <p class="text-sm text-gray-500 mt-1">Source: src/contracts/${c.file}</p>
        </div>
        <div class="flex space-x-2">
          <button onclick="copyUrl('/contracts/${c.file}')" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold text-sm transition flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Copy TS Interface
          </button>
          <button onclick="copyUrl('/${c.baseName}.json')" class="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold text-sm transition flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Copy JSON URL
          </button>
        </div>
      </div>`;
  }

  // 3. Generate the UI
  let rolesHTML = planData.roles.map((r: any) => `
    <tr class="border-b hover:bg-gray-50 transition">
      <td class="p-3 font-semibold text-gray-800">${r.dev}</td>
      <td class="p-3 text-gray-600">${r.role}</td>
      <td class="p-3"><span class="px-2 py-1 bg-gray-100 border rounded text-xs font-mono">${r.contract}.ts</span></td>
      <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${r.type === 'Producer' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}">${r.type}</span></td>
    </tr>`).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PVH WIP - Developer Portal</title>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 p-4 md:p-8 font-sans">
      
      <!-- Toast Notification -->
      <div id="toast" class="fixed bottom-5 right-5 transform translate-y-20 opacity-0 transition-all duration-300 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center z-50">
        <svg class="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span id="toast-msg">Copied to clipboard!</span>
      </div>

      <div class="max-w-6xl mx-auto">
        <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-5">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 flex items-center">
              <svg class="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              PVH WIP Integration
            </h1>
            <p class="text-gray-500 mt-2 text-lg">Central Developer Portal & Contract Hub</p>
          </div>
          <div class="mt-4 md:mt-0 text-left md:text-right">
            <span class="inline-block px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-bold shadow-sm mb-2">● Live Server</span>
            <p class="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">Build: ${buildTime}</p>
          </div>
        </header>

        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <!-- Left Column: API Endpoints -->
          <section class="xl:col-span-7">
            <div class="flex justify-between items-end mb-4">
              <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                Available API Contracts
              </h2>
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sorted by newest</span>
            </div>
            ${contractLinksHTML || '<p class="text-gray-500 italic bg-white p-5 rounded-xl border border-dashed text-center">No contracts defined yet.</p>'}
          </section>

          <!-- Right Column: Team Roster -->
          <section class="xl:col-span-5">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Team Responsibilities
            </h2>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                  <tr><th class="p-4 text-gray-700">Developer</th><th class="p-4 text-gray-700">Domain</th><th class="p-4 text-gray-700">Contract</th><th class="p-4 text-gray-700">Role</th></tr>
                </thead>
                <tbody>${rolesHTML}</tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <script>
        function copyUrl(path) {
          // Detects the GitHub Pages base URL automatically (e.g. https://org.github.io/repo-name)
          const baseUrl = window.location.href.split('?')[0].replace(/#$/, '').replace(/\\/$/, '').replace(/\\/index\\.html$/, '');
          const fullUrl = baseUrl + path;
          
          navigator.clipboard.writeText(fullUrl).then(() => {
            const toast = document.getElementById('toast');
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
          }).catch(err => {
            alert('Failed to copy: ' + fullUrl);
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