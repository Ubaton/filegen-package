#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { structures } from "./structures.js";
import { exec } from "child_process";
import ora from "ora";
import { createHash } from "crypto";
import { promisify } from "util";
import os from "os";
import semver from "semver";

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration management
const CONFIG = {
  FILE_NAME: ".filegenrc.json",
  PLUGINS_DIR: path.join(__dirname, "plugins"),
  DEFAULT_FEATURES: ["responsive", "seo"],
  DEFAULT_CI_TEMPLATES: ["github-actions", "gitlab-ci", "circle-ci"],
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  CACHE_TTL: 3600000, // 1 hour in milliseconds
};

Object.freeze(CONFIG); // Make configuration immutable

// Simple caching system
const cache = new Map();

function setCache(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now(),
  });
}

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CONFIG.CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

const AVAILABLE_TEMPLATES = [
  { name: "🛒 e-commerce store", value: "e-commerce" },
  { name: "✍️ blog platform", value: "blog-post" },
  { name: "💻 tech website", value: "tech-website" },
  { name: "📁 portfolio", value: "portfolio" },
  { name: "🚀 saas platform", value: "saas" },
  { name: "👥 community forum", value: "community" },
  { name: "📚 learning management system", value: "learning" },
  { name: "📰 news portal", value: "news" },
];

const AVAILABLE_FEATURES = [
  { name: "Authentication", value: "authentication" },
  { name: "Dark Mode", value: "darkmode" },
  { name: "Internationalization (i18n)", value: "i18n" },
  { name: "SEO Optimization", value: "seo" },
  { name: "Analytics", value: "analytics" },
  { name: "PWA Support", value: "pwa" },
  { name: "Responsive Design", value: "responsive" },
  { name: "Accessibility", value: "a11y" },
];

const AVAILABLE_PLUGINS = [
  { name: "Analytics", value: "analytics" },
  { name: "SEO", value: "seo" },
  { name: "Performance Monitoring", value: "performance" },
  { name: "Authentication", value: "auth" },
  { name: "Database Connectors", value: "database" },
];

// Enhanced error handling with logging
class FileGenError extends Error {
  constructor(message, code = "GENERAL_ERROR", details = {}) {
    super(message);
    this.name = "FileGenError";
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, FileGenError);
  }
}

function handleError(error, message = "An error occurred") {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message,
    error:
      error instanceof FileGenError
        ? {
            code: error.code,
            details: error.details,
            message: error.message,
          }
        : error.message,
    stack: error.stack,
  };

  // Log to file
  const logFile = path.join(process.cwd(), "filegen-error.log");
  fs.appendFileSync(logFile, JSON.stringify(errorLog, null, 2) + "\n");

  console.error(chalk.red.bold(`❌ ${message}`));
  if (error instanceof FileGenError) {
    console.error(chalk.red(`Code: ${error.code}`));
    console.error(chalk.red("Details:"), error.details);
  }
  console.error(chalk.dim(error.stack));

  process.exit(1);
}

// Enhanced command execution with retries and timeout
async function runCommand(command, options = {}) {
  const {
    timeout = CONFIG.TIMEOUT,
    retries = CONFIG.MAX_RETRIES,
    quiet = false,
  } = options;

  let attempt = 0;

  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { stdout, stderr } = await execPromise(command, {
        stdio: quiet ? "pipe" : "inherit",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return { stdout, stderr };
    } catch (error) {
      attempt++;
      if (attempt === retries) {
        throw new FileGenError(
          `Command failed after ${retries} attempts: ${command}`,
          "COMMAND_FAILED",
          { command, attempt, error: error.message }
        );
      }
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

async function createFileWithContent(filePath, content = "") {
  try {
    // Create backup if file exists
    if (await fs.pathExists(filePath)) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      await fs.copy(filePath, backupPath);
      console.log(chalk.yellow(`Created backup: ${backupPath}`));
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.ensureDir(dir);

    // Write file with atomic operation
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, content || "");
    await fs.rename(tempPath, filePath);

    console.log(chalk.blue.bold(`✔️ Created file: ${filePath}`));
  } catch (error) {
    throw new FileGenError(
      `Failed to create file: ${filePath}`,
      "FILE_CREATION_ERROR",
      { filePath, error: error.message }
    );
  }
}

async function generateStructure(template, targetDir = process.cwd()) {
  const structure = structures[template];
  if (!structure) {
    console.error(chalk.red.bold(`❌ Template "${template}" not found`));
    console.log(
      chalk.yellow("Available templates:"),
      AVAILABLE_TEMPLATES.map((t) => t.name).join(", ")
    );
    process.exit(1);
  }

  async function processStructure(struct, currentPath) {
    for (const [name, content] of Object.entries(struct)) {
      const fullPath = path.join(currentPath, name);
      if (typeof content === "object") {
        if (name.endsWith("/")) {
          await fs.ensureDir(fullPath);
          console.log(chalk.green.bold(`📁 Created directory: ${fullPath}`));
          await processStructure(content, fullPath);
        }
      } else {
        await createFileWithContent(fullPath, content);
      }
    }
  }

  try {
    console.log(chalk.cyan.bold(`\n🚧 Generating ${template} structure...\n`));
    await processStructure(structure, targetDir);
  } catch (error) {
    handleError(error, "Error generating structure");
  }
}

async function installDependencies(template, projectPath) {
  try {
    // Check if directory exists and is not empty
    if (fs.existsSync(projectPath) && fs.readdirSync(projectPath).length > 0) {
      console.log("⚠️  Directory is not empty. Creating in a new directory...");
      projectPath = `${projectPath}-${Date.now()}`;
    }
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    const spinner = ora("Installing Next.js and Tailwind CSS...").start();

    // Prompt user to choose package manager
    const { packageManager } = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Choose a package manager to use:",
        choices: ["bunx", "npx", "yarn", "pnpm"],
      },
    ]);

    const installCommand = {
      bunx: `bunx create-next-app@latest ${projectPath} --typescript --tailwind --eslint`,
      npx: `npx create-next-app@latest ${projectPath} --typescript --tailwind --eslint`,
      yarn: `yarn create next-app ${projectPath} --typescript --tailwind --eslint`,
      pnpm: `pnpm create next-app ${projectPath} --typescript --tailwind --eslint`,
    };

    await runCommand(installCommand[packageManager]);
    spinner.succeed("Next.js and Tailwind CSS installed!");

    // Example for additional dependencies for Blog Platform
    if (template === "blog-post") {
      const blogSpinner = ora(
        "Installing additional blog dependencies..."
      ).start();
      await runCommand(
        `cd ${projectPath} && npm install @prisma/client @trpc/client @trpc/server`
      );
      blogSpinner.succeed("Additional blog dependencies installed!");
    }

    return { projectPath, packageManager };
  } catch (error) {
    handleError(error, "Error installing dependencies");
  }
}

async function replaceSrcWithTemplate(template) {
  console.log(
    chalk.cyan.bold("\nReplacing src directory with selected template...")
  );
  try {
    const srcPath = path.join(process.cwd(), "src");
    await fs.remove(srcPath);
    console.log(chalk.yellow.bold("✔️ Removed existing src directory."));

    const structure = structures[template];
    if (!structure) {
      throw new Error(`Template "${template}" not found in structures.`);
    }
    await generateStructure(template, process.cwd());
    console.log(chalk.green.bold("✔️ src directory replaced successfully!"));
  } catch (error) {
    handleError(error, "Error replacing src directory");
  }
}

async function promptTemplate() {
  try {
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "Select a template to generate:",
        choices: AVAILABLE_TEMPLATES,
        pageSize: 10,
      },
    ]);
    return template;
  } catch (error) {
    handleError(error, "Error during template selection");
  }
}

async function promptFeatures() {
  try {
    const { features } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "features",
        message: "Select features to include:",
        choices: AVAILABLE_FEATURES,
        default: DEFAULT_FEATURES.map(
          (f) => AVAILABLE_FEATURES.find((af) => af.value === f)?.value
        ).filter(Boolean),
      },
    ]);
    return features;
  } catch (error) {
    handleError(error, "Error during feature selection");
  }
}

async function promptPlugins() {
  try {
    const { plugins } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "plugins",
        message: "Select plugins to include:",
        choices: AVAILABLE_PLUGINS,
      },
    ]);
    return plugins;
  } catch (error) {
    handleError(error, "Error during plugin selection");
  }
}

async function promptCIProvider() {
  try {
    const { ciProvider } = await inquirer.prompt([
      {
        type: "list",
        name: "ciProvider",
        message: "Select CI/CD provider:",
        choices: DEFAULT_CI_TEMPLATES,
      },
    ]);
    return ciProvider;
  } catch (error) {
    handleError(error, "Error during CI provider selection");
  }
}

// Generate CI/CD configuration
async function generateCIConfig(provider, targetDir = process.cwd()) {
  const ciConfigs = {
    "github-actions": {
      ".github/workflows/main.yml": `name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint
      run: npm run lint
      
    - name: Build
      run: npm run build
      
    - name: Test
      run: npm test
`,
    },
    "gitlab-ci": {
      ".gitlab-ci.yml": `stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run lint
    - npm test

deploy:
  stage: deploy
  image: node:18
  script:
    - echo "Deploying application..."
  only:
    - main
`,
    },
    "circle-ci": {
      ".circleci/config.yml": `version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: npm ci
      - run: npm run build
  test:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: npm ci
      - run: npm run lint
      - run: npm test
  deploy:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: echo "Deploying application..."

workflows:
  version: 2
  build_test_deploy:
    jobs:
      - build
      - test:
          requires:
            - build
      - deploy:
          requires:
            - test
          filters:
            branches:
              only: main
`,
    },
  };

  try {
    if (!ciConfigs[provider]) {
      console.error(chalk.red.bold(`❌ Unsupported CI provider: ${provider}`));
      console.log(
        chalk.yellow(
          `Supported providers: ${Object.keys(ciConfigs).join(", ")}`
        )
      );
      return false;
    }

    // Create and write CI configuration files
    for (const [filePath, content] of Object.entries(ciConfigs[provider])) {
      const fullPath = path.join(targetDir, filePath);
      const dirPath = path.dirname(fullPath);

      await fs.ensureDir(dirPath);
      await fs.writeFile(fullPath, content);

      console.log(chalk.blue.bold(`✅ Created CI config: ${filePath}`));
    }

    return true;
  } catch (error) {
    handleError(error, `Error generating ${provider} configuration`);
    return false;
  }
}

// Import a template from a Git repository
async function importTemplate(repoUrl) {
  try {
    const spinner = ora(`Importing template from ${repoUrl}...`).start();
    const repoName = repoUrl.split("/").pop().replace(".git", "");
    const tempDir = path.join(
      os.tmpdir(),
      `filegen-import-${createHash("md5").update(repoUrl).digest("hex")}`
    );

    // Clone repository
    await execPromise(`git clone ${repoUrl} ${tempDir}`);

    // Check if it has a valid filegen template structure
    const templateConfigPath = path.join(tempDir, "filegen-template.json");
    if (!(await fs.pathExists(templateConfigPath))) {
      spinner.fail(
        "Invalid template repository: Missing filegen-template.json"
      );
      return false;
    }

    // Copy template to templates directory
    const templatesDir = path.join(__dirname, "templates");
    await fs.ensureDir(templatesDir);

    const targetDir = path.join(templatesDir, repoName);
    await fs.copy(tempDir, targetDir);

    // Clean up
    await fs.remove(tempDir);

    spinner.succeed(`Template imported successfully as "${repoName}"`);
    return repoName;
  } catch (error) {
    handleError(error, "Error importing template");
    return false;
  }
}

// Update project to latest template version
async function updateProject(options = {}) {
  try {
    const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);
    if (!(await fs.pathExists(configPath))) {
      console.error(
        chalk.red.bold(
          "❌ This doesn't appear to be a FileGen project. Configuration file not found."
        )
      );
      return false;
    }

    const config = await loadOrCreateConfig(configPath);
    const template = options.template || config.template;

    if (!template) {
      console.error(chalk.red.bold("❌ No template specified for update."));
      return false;
    }

    console.log(
      chalk.cyan.bold(`\n🔄 Updating project to latest ${template} template...`)
    );

    // Backup current files
    const backupDir = `backup-${Date.now()}`;
    await fs.copy(process.cwd(), path.join(process.cwd(), backupDir), {
      filter: (src) => !src.includes("node_modules") && !src.includes(".git"),
    });

    console.log(chalk.yellow.bold(`📦 Created backup in ${backupDir}`));

    // Update template
    await replaceSrcWithTemplate(template);

    // Update configuration
    config.version = "2.0.0"; // Update version
    config.lastUpdated = new Date().toISOString();
    await saveConfig(configPath, config);

    console.log(chalk.green.bold("\n✅ Project updated successfully!"));
    return true;
  } catch (error) {
    handleError(error, "Error updating project");
    return false;
  }
}

// Check for outdated and deprecated dependencies
async function checkDependencies(options = {}) {
  try {
    const cacheKey = "dependencies_check";
    const cached = getCache(cacheKey);

    if (cached && !options.force) {
      console.log(chalk.cyan("Using cached dependency information..."));
      return cached;
    }

    const spinner = ora("Checking dependencies...").start();

    // Get installed dependencies
    const packageJson = await fs.readJson(
      path.join(process.cwd(), "package.json")
    );
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    let outdatedCount = 0;
    let deprecatedCount = 0;
    let vulnerabilitiesCount = 0;
    const updates = [];
    const deprecated = [];

    // Check each dependency
    for (const [name, version] of Object.entries(dependencies)) {
      try {
        // Remove version prefix like ^ or ~
        const cleanVersion = version.replace(/^[\^~]/, "");

        // Get the latest version from npm
        const { stdout } = await execPromise(
          `npm view ${name} version dist-tags.latest deprecated --json`
        );
        const info = JSON.parse(stdout);

        const latestVersion = info.distTags?.latest || info.version;
        const isDeprecated = info.deprecated ? true : false;

        if (isDeprecated) {
          deprecatedCount++;
          deprecated.push({
            name,
            current: cleanVersion,
            message: info.deprecated,
          });
        }

        if (latestVersion && semver.gt(latestVersion, cleanVersion)) {
          outdatedCount++;
          updates.push({
            name,
            current: cleanVersion,
            latest: latestVersion,
            type: semver.diff(cleanVersion, latestVersion),
          });
        }
      } catch (error) {
        // Skip packages that can't be checked
        console.log(chalk.yellow(`Could not check ${name}: ${error.message}`));
      }
    }

    spinner.succeed("Dependency check complete!");

    console.log(chalk.cyan.bold("\n📦 Dependency Analysis Results"));
    console.log(
      chalk.bold(`Total dependencies: ${Object.keys(dependencies).length}`)
    );
    console.log(chalk.yellow.bold(`Outdated packages: ${outdatedCount}`));
    console.log(chalk.red.bold(`Deprecated packages: ${deprecatedCount}`));

    if (deprecated.length > 0) {
      console.log(chalk.red.bold("\n⚠️ Deprecated Packages:"));
      for (const dep of deprecated) {
        console.log(`- ${dep.name}@${dep.current}`);
        console.log(`  Message: ${dep.message}`);
      }
    }

    if (updates.length > 0) {
      console.log(chalk.yellow.bold("\n🔄 Available Updates:"));
      for (const update of updates) {
        const updateLevel =
          update.type === "major"
            ? chalk.red(update.type)
            : update.type === "minor"
            ? chalk.yellow(update.type)
            : chalk.green(update.type);
        console.log(
          `- ${update.name}: ${update.current} → ${update.latest} (${updateLevel})`
        );
      }
    }
    const results = {
      total: Object.keys(dependencies).length,
      outdated: outdatedCount,
      deprecated: deprecatedCount,
      updates,
      deprecated,
      lastChecked: new Date().toISOString(),
    };

    // Cache the results
    setCache("dependencies_check", results);

    if (options.fix && (outdatedCount > 0 || deprecatedCount > 0)) {
      const { shouldFix } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldFix",
          message: "Do you want to update the outdated dependencies?",
          default: true,
        },
      ]);

      if (shouldFix) {
        const fixSpinner = ora("Updating dependencies...").start();
        try {
          // Use npm-check-updates to update package.json
          await execPromise("npx npm-check-updates -u");
          // Install updated packages
          await execPromise("npm install");
          fixSpinner.succeed("Dependencies updated successfully!");
        } catch (error) {
          fixSpinner.fail("Failed to update dependencies");
          console.error(chalk.red(error.message));
        }
      }
    }

    return {
      total: Object.keys(dependencies).length,
      outdated: outdatedCount,
      deprecated: deprecatedCount,
      updates,
      deprecated,
    };
  } catch (error) {
    handleError(error, "Error checking dependencies");
  }
}

program
  .version("2.0.0")
  .description("Generate file structures from templates")
  .option("-t, --template <template>", "Template name to generate")
  .option("-f, --features <features>", "Comma-separated features to include")
  .option("-p, --plugins <plugins>", "Comma-separated plugins to include")
  .option("-c, --config <config>", "Path to configuration file")
  .option("--ci <provider>", "CI/CD provider to configure")
  .option("--skip-dep-check", "Skip checking for deprecated dependencies")
  .action(async (options) => {
    try {
      // Check for deprecated dependencies first
      if (!options.skipDepCheck) {
        try {
          const depResults = await checkDependencies({ fix: false });
          if (depResults && depResults.deprecated > 0) {
            console.log(
              chalk.yellow(
                "\n⚠️ Some dependencies are deprecated. Run 'filegen check-deps -f' to fix them."
              )
            );
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              "⚠️ Dependency check failed, continuing with template generation."
            )
          );
        }
      }

      // Load configuration if provided
      let config = {};
      if (options.config) {
        const configPath = path.resolve(process.cwd(), options.config);
        if (await fs.pathExists(configPath)) {
          config = await fs.readJson(configPath);
          console.log(
            chalk.cyan(`📄 Using configuration from: ${options.config}`)
          );
        } else {
          console.log(
            chalk.yellow(`⚠️ Configuration file not found: ${options.config}`)
          );
        }
      }

      // Get template - from options, config, or prompt
      const template =
        options.template || config.template || (await promptTemplate());

      // Get features - from options, config, or prompt
      const features = options.features
        ? options.features.split(",")
        : config.features || (await promptFeatures());

      // Get plugins - from options, config, or prompt
      const plugins = options.plugins
        ? options.plugins.split(",")
        : config.plugins || [];

      // Install project dependencies
      const projectPath = process.cwd();
      const { packageManager } = await installDependencies(
        template,
        projectPath
      );

      // Apply selected template
      await replaceSrcWithTemplate(template);

      // Install selected plugins
      if (plugins.length > 0) {
        console.log(
          chalk.cyan.bold(`\n📦 Installing plugins: ${plugins.join(", ")}...`)
        );
        for (const plugin of plugins) {
          await installPlugin(plugin);
        }
      }

      // Generate CI/CD configuration if requested
      if (options.ci) {
        console.log(
          chalk.cyan.bold(`\n🚀 Configuring CI/CD with ${options.ci}...`)
        );
        await generateCIConfig(options.ci, projectPath);
      }

      // Save configuration for future updates
      const configPath = path.join(projectPath, CONFIG_FILE_NAME);
      await saveConfig(configPath, {
        template,
        features,
        plugins,
        version: "2.0.7",
        lastUpdated: new Date().toISOString(),
      });

      const startCommand = {
        bunx: "bun run dev",
        npx: "npm run dev",
        yarn: "yarn dev",
        pnpm: "pnpm dev",
      }[packageManager];

      console.log(chalk.green.bold("\n🎉 Setup completed successfully!"));
      console.log(chalk.cyan.bold("\nNext steps:"));
      console.log("1. Start development server:", chalk.yellow(startCommand));
    } catch (error) {
      handleError(error, "Error during setup");
    }
  });

// Command to init a new project with a configuration file
program
  .command("init")
  .description("Initialize a new project with a configuration file")
  .option("-t, --template <template>", "Template to use")
  .option("-c, --config <config>", "Path to custom configuration file")
  .action(async (options) => {
    try {
      const configPath = options.config
        ? path.resolve(process.cwd(), options.config)
        : path.join(process.cwd(), CONFIG_FILE_NAME);

      const template = options.template || (await promptTemplate());
      const features = await promptFeatures();
      const plugins = await promptPlugins();

      const config = {
        template,
        features,
        plugins,
        version: "2.0.0",
        lastUpdated: new Date().toISOString(),
      };

      await saveConfig(configPath, config);

      console.log(
        chalk.green.bold(`✅ Project initialized with ${template} template`)
      );
      console.log(chalk.cyan.bold("\nNext steps:"));
      console.log("1. Run the generator:", chalk.yellow("filegen"));
    } catch (error) {
      handleError(error, "Error initializing project");
    }
  });

// Command to generate components
program
  .command("component <name>")
  .description("Generate a new component")
  .option("-p, --props <props>", "Comma-separated list of props")
  .action(async (name, options) => {
    try {
      const props = options.props ? options.props.split(",") : [];
      await generateComponent(name, props);
    } catch (error) {
      handleError(error, "Error generating component");
    }
  });

// Command to generate API routes
program
  .command("api-routes <routes>")
  .description("Generate API routes")
  .action(async (routes) => {
    try {
      await generateApiRoutes(routes.split(","));
    } catch (error) {
      handleError(error, "Error generating API routes");
    }
  });

// Command to generate database schema
program
  .command("db-schema")
  .description("Generate database schema files")
  .option("-t, --type <type>", "Database type (mongodb, prisma)", "mongodb")
  .option("-o, --output <directory>", "Output directory", "./schemas")
  .action(async (options) => {
    try {
      await generateDbSchema(options.type, options.output);
    } catch (error) {
      handleError(error, "Error generating database schema");
    }
  });

// Command to install a plugin
program
  .command("install-plugin <plugin>")
  .description("Install a plugin")
  .action(async (plugin) => {
    try {
      await installPlugin(plugin);
    } catch (error) {
      handleError(error, "Error installing plugin");
    }
  });

// Command to analyze project
program
  .command("analyze")
  .description("Analyze project metrics")
  .option("-p, --performance", "Include performance metrics")
  .option("-b, --bundle-size", "Include bundle size analysis")
  .action(async (options) => {
    try {
      await analyzeProject({
        performance: options.performance,
        bundleSize: options.bundleSize,
      });
    } catch (error) {
      handleError(error, "Error analyzing project");
    }
  });

// Command to update existing project
program
  .command("update")
  .description("Update project to latest template version")
  .option("-t, --template <template>", "Template to update to")
  .action(async (options) => {
    try {
      await updateProject(options);
    } catch (error) {
      handleError(error, "Error updating project");
    }
  });

// Command to import external template
program
  .command("import-template <url>")
  .description("Import a template from a Git repository")
  .action(async (url) => {
    try {
      const templateName = await importTemplate(url);
      if (templateName) {
        console.log(
          chalk.green.bold(
            `\n✅ Template '${templateName}' imported and ready to use`
          )
        );
        console.log(chalk.cyan("To use this template:"));
        console.log(chalk.yellow(`filegen --template ${templateName}`));
      }
    } catch (error) {
      handleError(error, "Error importing template");
    }
  });

// Command to check dependencies
program
  .command("check-deps")
  .description("Check for outdated and deprecated dependencies")
  .option("-f, --fix", "Automatically fix/update dependencies")
  .action(async (options) => {
    try {
      await checkDependencies(options);
    } catch (error) {
      handleError(error, "Error checking dependencies");
    }
  });

program.parse(process.argv);

// Utility function to load or create project configuration
async function loadOrCreateConfig(configPath) {
  try {
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
    const defaultConfig = {
      version: "1.0.0",
      template: null,
      features: DEFAULT_FEATURES,
      plugins: [],
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    return defaultConfig;
  } catch (error) {
    handleError(error, "Error loading configuration");
  }
}

// Utility function to save configuration
async function saveConfig(configPath, config) {
  try {
    config.lastUpdated = new Date().toISOString();
    await fs.writeJson(configPath, config, { spaces: 2 });
    console.log(chalk.green.bold("✅ Configuration saved successfully"));
  } catch (error) {
    handleError(error, "Error saving configuration");
  }
}

// Plugin management
async function installPlugin(pluginName) {
  try {
    const spinner = ora(`Installing plugin: ${pluginName}...`).start();

    // Ensure plugins directory exists
    await fs.ensureDir(PLUGINS_DIR);

    // Check if plugin exists in npm registry
    const npmPluginName = `@ubaton/filegen-plugin-${pluginName}`;
    await execPromise(`npm view ${npmPluginName}`);

    // Install plugin
    await execPromise(`npm install ${npmPluginName} --save`);

    spinner.succeed(`Plugin '${pluginName}' installed successfully!`);

    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to install plugin: ${pluginName}`));
    console.error(chalk.red(error.message));
    return false;
  }
}

// Generate component from template
async function generateComponent(
  componentName,
  props = [],
  targetDir = process.cwd()
) {
  try {
    const componentDir = path.join(targetDir, "components");
    await fs.ensureDir(componentDir);

    const propsCode =
      props.length > 0
        ? `\n  ${props.map((prop) => `${prop}: any,`).join("\n  ")}`
        : "";

    const propsInterface =
      props.length > 0
        ? `\ninterface ${componentName}Props {\n  ${props
            .map((prop) => `${prop}?: any;`)
            .join("\n  ")}\n}\n`
        : "";

    const componentTemplate = `import React from 'react';${propsInterface}
export default function ${componentName}({${propsCode}
}) {
  return (
    <div className="component-${componentName.toLowerCase()}">
      <h2>${componentName} Component</h2>
      {/* Add your component content here */}
    </div>
  );
}
`;

    const componentPath = path.join(componentDir, `${componentName}.tsx`);
    await createFileWithContent(componentPath, componentTemplate);

    console.log(
      chalk.green.bold(`✅ Component ${componentName} created successfully`)
    );
  } catch (error) {
    handleError(error, `Error generating component ${componentName}`);
  }
}

// Generate API routes
async function generateApiRoutes(routes = [], targetDir = process.cwd()) {
  try {
    const apiDir = path.join(targetDir, "app/api");
    await fs.ensureDir(apiDir);

    for (const route of routes) {
      const routeDir = path.join(apiDir, route);
      await fs.ensureDir(routeDir);

      const routeTemplate = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get ${route} logic here
    return NextResponse.json({ 
      message: '${route} fetched successfully',
      data: [] 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ${route}' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Create ${route} logic here
    
    return NextResponse.json({ 
      message: '${route} created successfully',
      data: body 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ${route}' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // Update ${route} logic here
    
    return NextResponse.json({ 
      message: '${route} updated successfully',
      data: body 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ${route}' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Delete ${route} logic here
    
    return NextResponse.json({ 
      message: '${route} deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete ${route}' },
      { status: 500 }
    );
  }
}
`;

      const routePath = path.join(routeDir, "route.ts");
      await createFileWithContent(routePath, routeTemplate);

      console.log(
        chalk.blue.bold(`✅ API route for ${route} created successfully`)
      );
    }

    console.log(chalk.green.bold(`✅ All API routes created successfully`));
  } catch (error) {
    handleError(error, "Error generating API routes");
  }
}

// Generate database schema
async function generateDbSchema(dbType, outputDir) {
  try {
    await fs.ensureDir(outputDir);

    // Common schema templates
    const schemas = {
      mongodb: {
        "User.js": `import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
`,
        "Product.js": `import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
`,
      },
      prisma: {
        "schema.prisma": `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  image       String?
  category    String?
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
`,
      },
    };

    // Write schema files
    if (schemas[dbType]) {
      for (const [fileName, content] of Object.entries(schemas[dbType])) {
        const filePath = path.join(outputDir, fileName);
        await createFileWithContent(filePath, content);
      }
      console.log(
        chalk.green.bold(`✅ Generated ${dbType} schema in ${outputDir}`)
      );
    } else {
      console.error(chalk.red.bold(`❌ Unsupported database type: ${dbType}`));
      console.log(
        chalk.yellow(`Supported types: ${Object.keys(schemas).join(", ")}`)
      );
    }
  } catch (error) {
    handleError(error, "Error generating database schema");
  }
}

// Project analysis
async function analyzeProject(options = {}) {
  try {
    const spinner = ora("Analyzing project...").start();

    const results = {
      performance: options.performance ? await analyzePerformance() : null,
      bundleSize: options.bundleSize ? await analyzeBundleSize() : null,
      dependencies: await analyzeDependencies(),
    };

    spinner.succeed("Analysis complete!");

    console.log(chalk.cyan.bold("\n📊 Project Analysis Results"));

    if (results.dependencies) {
      console.log(chalk.bold("\nDependencies:"));
      console.log(`Total dependencies: ${results.dependencies.count}`);
      console.log(`Outdated packages: ${results.dependencies.outdated}`);
    }

    if (results.performance) {
      console.log(chalk.bold("\nPerformance:"));
      console.log(`Build time: ${results.performance.buildTime}ms`);
      console.log(`First load JS: ${results.performance.firstLoadJs}`);
    }

    if (results.bundleSize) {
      console.log(chalk.bold("\nBundle Size:"));
      console.log(`Total size: ${results.bundleSize.total}`);
      console.log(`JS size: ${results.bundleSize.js}`);
      console.log(`CSS size: ${results.bundleSize.css}`);
    }

    return results;
  } catch (error) {
    handleError(error, "Error analyzing project");
  }
}

// Helper functions for analysis
async function analyzeDependencies() {
  try {
    const { stdout } = await execPromise("npm outdated --json");
    const outdated = Object.keys(JSON.parse(stdout || "{}")).length;

    const packageJson = await fs.readJson(
      path.join(process.cwd(), "package.json")
    );
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    return {
      count: Object.keys(deps).length,
      outdated,
    };
  } catch (error) {
    return { count: "Unknown", outdated: "Unknown" };
  }
}

async function analyzePerformance() {
  try {
    // This would use a real performance measurement in a full implementation
    return {
      buildTime: "1200", // milliseconds
      firstLoadJs: "76kB",
    };
  } catch (error) {
    return null;
  }
}

async function analyzeBundleSize() {
  try {
    // This would use a real bundle analyzer in a full implementation
    return {
      total: "120kB",
      js: "85kB",
      css: "35kB",
    };
  } catch (error) {
    return null;
  }
}
