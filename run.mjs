import { spawnSync } from "child_process";
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

async function downloadFile(fetch, url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  const fileStream = fs.createWriteStream(outputPath);
  response.body.pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });
}

function extractZip(unzipper, zipPath, extractTo) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractTo }))
      .on("close", resolve)
      .on("error", reject);
  });
}

(async () => {
  try {
    console.log("Starting setup...");

    // Step 1: Install dependencies
    await installDependencies();

    // Step 2: Import dependencies dynamically
    const { default: fetch } = await import("node-fetch");
    const unzipper = await import("unzipper");

    // Step 3: Variables for downloading and extracting the project
    const zipUrl = "https://github.com/DeeCeeXxx/Queen_Anita-V4/archive/refs/heads/main.zip";
    const zipPath = path.resolve(__dirname, "main.zip");
    const extractPath = path.resolve(__dirname, "Queen_Anita-V4-main");

    // Step 4: Download the ZIP file
    console.log("Downloading the ZIP file...");
    await downloadFile(fetch, zipUrl, zipPath);
    console.log("Download complete!");

    // Step 5: Extract the ZIP file
    console.log("Extracting the ZIP file...");
    await extractZip(unzipper, zipPath, __dirname);
    console.log("Extraction complete!");

    // Step 6: Install project dependencies
    console.log("Installing project dependencies...");
    const installResult = spawnSync("npm", ["install"], { cwd: extractPath, stdio: "inherit" });
    if (installResult.status !== 0) {
      throw new Error("Failed to install project dependencies.");
    }
    console.log("Project dependencies installed successfully!");

    // Step 7: Start the application
    console.log("Starting the application...");
    const startResult = spawnSync("npm", ["start"], { cwd: extractPath, stdio: "inherit" });
    if (startResult.status !== 0) {
      throw new Error("Failed to start the application.");
    }

    console.log("Application started successfully!");
  } catch (error) {
    console.error("\nAn error occurred:", error);
  }
})();
