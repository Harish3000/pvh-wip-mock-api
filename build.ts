import * as fs from 'fs-extra';
import * as path from 'path';

const srcDir = path.join(__dirname, 'src', 'contracts');
const outDir = path.join(__dirname, 'public');

async function build() {
  await fs.emptyDir(outDir);
  // Using Asia/Colombo timezone explicitly
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
  const { planData } = require('./src/plan');

  // 1. Output the Plan JSON
  await fs.outputJson(path.join(outDir, 'api', 'plan.json'), { _metadata: { lastUpdated: timestamp }, payload: planData }, { spaces: 2 });

  let contractLinksHTML = '';

  // 2. Process Contracts
  if (await fs.pathExists(srcDir)) {
    const files = await fs.readdir(srcDir);
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const baseName = file.replace('.ts', '');
        const module = require(path.join(srcDir, file));
        
        if (module.mockData) {
          const wrappedData = { _metadata: { lastUpdated: timestamp, source: file }, payload: module.mockData };
          await fs.outputJson(path.join(outDir, 'api', 'mocks', `${baseName}.json`), wrappedData, { spaces: 2 });
        }
        await fs.copy(path.join(srcDir, file), path.join(outDir, 'api', 'contracts', file));

        contractLinksHTML += `
          <div class="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center mb-3">
            <div>
              <h3 class="text-lg font-bold text-gray-800">${baseName}</h3>
              <p class="text-sm text-gray-500">Auto-generated from ${file}</p>
            </div>
            <div class="flex space-x-3">
              <a href="/api/contracts/${file}" target="_blank" class="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold text-sm transition">View TS Interface</a>
              <a href="/api/mocks/${baseName}.json" target="_blank" class="px-4 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 font-semibold text-sm transition">GET JSON Data</a>
            </div>
          </div>`;
      }
    }
  }

  // 3. Generate the UI (Tailwind CSS)
  let rolesHTML = planData.roles.map((r: any) => `
    <tr class="border-b hover:bg-gray-50">
      <td class="p-3 font-semibold text-gray-800">${r.dev}</td>
      <td class="p-3 text-gray-600">${r.role}</td>
      <td class="p-3"><span class="px-2 py-1 bg-gray-100 rounded text-xs font-mono">${r.contract}.ts</span></td>
      <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${r.type === 'Producer' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}">${r.type}</span></td>
    </tr>`).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PVH WIP - Developer Portal</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 p-8 font-sans">
      <div class="max-w-5xl mx-auto">
        <header class="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900">PVH WIP Integration</h1>
            <p class="text-gray-500 mt-1">Single Source of Truth & Mock Server</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold shadow-sm">Live</span>
            <p class="text-xs text-gray-400 mt-2">Last Built: ${timestamp}</p>
          </div>
        </header>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section>
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              Available API Contracts
            </h2>
            ${contractLinksHTML || '<p class="text-gray-500 italic">No contracts defined yet.</p>'}
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Team Responsibilities
            </h2>
            <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <table class="w-full text-left text-sm">
                <thead class="bg-gray-100 border-b">
                  <tr><th class="p-3 text-gray-700">Developer</th><th class="p-3 text-gray-700">Domain</th><th class="p-3 text-gray-700">Contract</th><th class="p-3 text-gray-700">Role</th></tr>
                </thead>
                <tbody>${rolesHTML}</tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </body>
    </html>`;
  await fs.outputFile(path.join(outDir, 'index.html'), html);
  console.log('Build complete! UI and JSON API generated.');
}
build().catch(console.error);