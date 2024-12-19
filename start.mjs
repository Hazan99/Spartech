import { spawnSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function installDependencies() {
  console.log("Checking and installing required dependencies...");

  const dependencies = ["unzipper", "node-fetch"];
  console.log(`Installing ${dependencies.join(", ")}...`);

  // Install all dependencies at once
  const installResult = spawnSync("npm", ["install", ...dependencies, "--no-save"], { stdio: "inherit" });

  if (installResult.status !== 0) {
    throw new Error(`Failed to install dependencies. Ensure npm is installed.`);
  }

  // Verify installation
  for (const dependency of dependencies) {
    if (!fs.existsSync(path.resolve(__dirname, `node_modules/${dependency}`))) {
      throw new Error(`${dependency} did not install successfully.`);
    }
  }
  console.log("Dependencies installed successfully!");
}

// Function to dynamically import a module
async function dynamicImport(moduleName) {
  return await import(moduleName);
}

async function downloadFileWithProgress(fetch, url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  const totalSize = Number(response.headers.get("content-length"));
  let downloadedSize = 0;

  const fileStream = fs.createWriteStream(outputPath);
  console.log("Starting download...");
  response.body.on("data", (chunk) => {
    downloadedSize += chunk.length;
    process.stdout.write(`\rDownloading: ${(downloadedSize / totalSize * 100).toFixed(2)}%`);
  });

  return new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", () => {
      process.stdout.write("\n");
      console.log("Download complete!");
      resolve();
    });
  });
}

async function extractZip(unzipper, zipPath, extractTo) {
  return fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractTo }))
    .promise();
}

function executeCommandStream(command, args, workingDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: workingDir, shell: true });

    child.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data.toString());
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

(async () => {
  try {
    // Step 1: Install dependencies
    await installDependencies();

    // Step 2: Dynamically import dependencies
    const fetch = (await dynamicImport("node-fetch")).default;
    const unzipper = await dynamicImport("unzipper");

    // Step 3: Define variables
    const zipUrl = "https://github.com/Hazan99/codes/raw/main/Queen_Anita-V3.zip";
    const zipPath = path.resolve(__dirname, "main.zip");
    const extractPath = path.resolve(__dirname, "Queen_Anita-V3");

    // Step 4: Download the ZIP file
    console.log("Downloading the ZIP file...");
    await downloadFileWithProgress(fetch, zipUrl, zipPath);

    // Step 5: Extract the ZIP file
    console.log("Extracting the ZIP file...");
    await extractZip(unzipper, zipPath, __dirname);
    console.log("Extraction complete!");

    // Step 6: Install dependencies in the extracted directory
    console.log("Installing project dependencies...");
    await executeCommandStream("npm", ["install"], extractPath);

    // Step 7: Start the application
    console.log("Starting the application...");
    await executeCommandStream("npm", ["start"], extractPath);

    console.log("Application started successfully!");
  } catch (error) {
    console.error("\nAn error occurred:", error);
  }
})();
