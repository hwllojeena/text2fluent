const https = require("https");
const fs = require("fs");

function getApiKey() {
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

const apiKey = getApiKey();
if (!apiKey) {
  console.error("No API key found.");
  process.exit(1);
}

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    const supported = json.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    console.log(JSON.stringify(supported, null, 2));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
