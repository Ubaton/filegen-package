#!/usr/bin/env node

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("\nUnhandled Promise Rejection:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("\nUncaught Exception:", error);
  process.exit(1);
});

import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { structures } from "./structures.js";
import { exec } from "child_process";
import ora from "ora";
import { promisify } from "util";
import semver from "semver";

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Consolidated configuration
const CONFIG = Object.freeze({
  FILE_NAME: ".filegenrc.json",
  PLUGINS_DIR: path.join(__dirname, "plugins"),
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  CACHE_TTL: 3600000,
  VERSION: "2.0.10",
});

/**
 * Simple in-memory cache with TTL support
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Store a value in cache with current timestamp
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Retrieve a value from cache if not expired
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > CONFIG.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
}

const cache = new SimpleCache();

// Constants
const TEMPLATES = [
  { name: "🛒 e-commerce store", value: "e-commerce" },
  { name: "✍️ blog platform", value: "blog-post" },
  { name: "💻 tech website", value: "tech-website" },
  { name: "📁 portfolio", value: "portfolio" },
  { name: "🚀 saas platform", value: "saas" },
  { name: "👥 community forum", value: "community" },
  { name: "📚 learning management system", value: "learning" },
  { name: "📰 news portal", value: "news" },
];

const FEATURES = [
  { name: "Authentication", value: "authentication" },
  { name: "Dark Mode", value: "darkmode" },
  { name: "Internationalization (i18n)", value: "i18n" },
  { name: "SEO Optimization", value: "seo" },
  { name: "Analytics", value: "analytics" },
  { name: "PWA Support", value: "pwa" },
  { name: "Responsive Design", value: "responsive" },
  { name: "Accessibility", value: "a11y" },
];

const PLUGINS = [
  { name: "Analytics", value: "analytics" },
  { name: "SEO", value: "seo" },
  { name: "Performance Monitoring", value: "performance" },
  { name: "Authentication", value: "auth" },
  { name: "Database Connectors", value: "database" },
];

const CI_PROVIDERS = ["github-actions", "gitlab-ci", "circle-ci"];

/**
 * Custom error class for FileGen operations with enhanced error tracking
 * @extends Error
 */
class FileGenError extends Error {
  /**
   * Create a FileGenError
   * @param {string} message - The error message
   * @param {string} [code='GENERAL_ERROR'] - Error code for categorization
   * @param {Object} [details={}] - Additional error details and context
   * @param {Error} [details.originalError] - Original error if wrapping another error
   */
  constructor(message, code = "GENERAL_ERROR", details = {}) {
    super(message);
    this.name = "FileGenError";
    this.code = code;
    this.details = details;

    // Capture native errors
    if (details.originalError && details.originalError instanceof Error) {
      this.stack = details.originalError.stack;
      this.cause = details.originalError;
    } else {
      Error.captureStackTrace(this, FileGenError);
    }

    // Add timestamp for better debugging
    this.timestamp = new Date().toISOString();
  }

  /**
   * Convert error to JSON format for logging
   * @returns {Object} JSON representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Handle and log errors with detailed information
 * @param {Error|FileGenError} error - The error to handle
 * @param {string} [message='An error occurred'] - User-friendly error message
 */
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

  fs.appendFileSync(
    path.join(process.cwd(), "filegen-error.log"),
    JSON.stringify(errorLog, null, 2) + "\n"
  );

  console.error(chalk.red.bold(`❌ ${message}`));
  if (error instanceof FileGenError) {
    console.error(chalk.red(`Code: ${error.code}`));
    console.error(chalk.red("Details:"), error.details);
  }
  console.error(chalk.dim(error.stack));
  process.exit(1);
}

/**
 * Quote a path if it contains special characters
 * @param {string} p - The path to quote
 * @returns {string} Quoted path if needed, original path otherwise
 */
function quotePath(p) {
  if (!p) return p;
  // Wrap in double quotes and escape embedded quotes
  const needsQuoting = /\s|[()&^%!]/.test(p);
  const escaped = String(p).replace(/"/g, '\\"');
  return needsQuoting ? `"${escaped}"` : escaped;
}

/**
 * Execute a shell command with retry logic and timeout
 * @param {string} command - The command to execute
 * @param {Object} [options={}] - Execution options
 * @param {number} [options.timeout=30000] - Command timeout in milliseconds
 * @param {number} [options.retries=3] - Number of retry attempts
 * @param {boolean} [options.quiet=false] - Suppress output
 * @param {string} [options.cwd] - Working directory for command execution
 * @returns {Promise<{stdout: string, stderr: string}>} Command output
 * @throws {FileGenError} If command fails after all retries
 */
async function runCommand(command, options = {}) {
  const {
    timeout = CONFIG.TIMEOUT,
    retries = CONFIG.MAX_RETRIES,
    quiet = false,
    cwd,
  } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const result = await execPromise(command, {
        signal: controller.signal,
        cwd,
        maxBuffer: 10 * 1024 * 1024, // 10MB to avoid stdout buffer overflow on scaffolding
        windowsHide: true,
      });

      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      if (attempt === retries - 1) {
        throw new FileGenError(
          `Command failed after ${retries} attempts: ${command}`,
          "COMMAND_FAILED",
          { command, attempt: attempt + 1, error: error.message }
        );
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

/**
 * Create a file with content, backing up existing files
 * @param {string} filePath - Path to the file to create
 * @param {string} [content=''] - Content to write to the file
 * @throws {FileGenError} If file creation fails
 */
async function createFileWithContent(filePath, content = "") {
  try {
    if (await fs.pathExists(filePath)) {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      await fs.copy(filePath, backupPath);
      console.log(chalk.yellow(`Created backup: ${backupPath}`));
    }

    await fs.ensureDir(path.dirname(filePath));
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, content);
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

/**
 * Prompt user for input using inquirer
 * @param {string} type - Type of prompt (list, checkbox, confirm)
 * @param {Array} choices - Available choices for list/checkbox prompts
 * @param {string} message - Prompt message to display
 * @param {*} [defaultValue=null] - Default value for the prompt
 * @returns {Promise<*>} User's selection or input
 */
async function promptUser(type, choices, message, defaultValue = null) {
  const config = {
    list: { type: "list", name: "result", message, choices, pageSize: 10 },
    checkbox: {
      type: "checkbox",
      name: "result",
      message,
      choices,
      default: defaultValue,
    },
    confirm: {
      type: "confirm",
      name: "result",
      message,
      default: defaultValue,
    },
  };

  try {
    const { result } = await inquirer.prompt(config[type]);
    return result;
  } catch (error) {
    handleError(error, `Error during ${type} prompt`);
  }
}

/**
 * Generate project structure from template
 * @param {string} template - Template name to generate
 * @param {string} targetDir - Target directory for generation
 * @throws {Error} If template is not found or generation fails
 */
async function generateStructure(template, targetDir) {
  const structure = structures[template];
  if (!structure) {
    console.error(chalk.red.bold(`❌ Template "${template}" not found`));
    console.log(
      chalk.yellow("Available templates:"),
      TEMPLATES.map((t) => t.name).join(", ")
    );
    process.exit(1);
  }

  async function processStructure(struct, currentPath) {
    for (const [name, content] of Object.entries(struct)) {
      const fullPath = path.join(currentPath, name);
      if (typeof content === "object" && name.endsWith("/")) {
        await fs.ensureDir(fullPath);
        console.log(chalk.green.bold(`📁 Created directory: ${fullPath}`));
        await processStructure(content, fullPath);
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

/**
 * Install project dependencies using selected package manager
 * @param {string} template - Template name for specialized dependencies
 * @param {string} projectPath - Path where project will be created
 * @returns {Promise<{projectPath: string, packageManager: string, isNewDirectory: boolean}>} Installation result
 */
async function installDependencies(template, projectPath) {
  try {
    let isNewDirectory = false;
    if (fs.existsSync(projectPath) && fs.readdirSync(projectPath).length > 0) {
      console.log("⚠️  Directory is not empty. Creating in a new directory...");
      projectPath = `${projectPath}-${Date.now()}`;
      isNewDirectory = true;
    }

    await fs.ensureDir(projectPath);
    const spinner = ora("Installing Next.js and Tailwind CSS...").start();

    const packageManager = await promptUser(
      "list",
      ["bunx", "npx", "yarn", "pnpm"],
      "Choose a package manager to use:"
    );

    const qPath = quotePath(projectPath);
    const commands = {
      bunx: `bunx create-next-app@latest ${qPath} --typescript --tailwind --eslint`,
      npx: `npx create-next-app@latest ${qPath} --typescript --tailwind --eslint`,
      yarn: `yarn create next-app ${qPath} --typescript --tailwind --eslint`,
      pnpm: `pnpm create next-app ${qPath} --typescript --tailwind --eslint`,
    };

    await runCommand(commands[packageManager]);
    spinner.succeed("Next.js and Tailwind CSS installed!");

    if (template === "blog-post") {
      const blogSpinner = ora(
        "Installing additional blog dependencies..."
      ).start();
      await runCommand(
        `npm install @prisma/client @trpc/client @trpc/server`,
        { cwd: projectPath }
      );
      blogSpinner.succeed("Additional blog dependencies installed!");
    }

    return { projectPath, packageManager, isNewDirectory };
  } catch (error) {
    handleError(error, "Error installing dependencies");
  }
}

/**
 * Replace src directory with template-specific structure
 * @param {string} template - Template name to use
 * @param {string} targetDir - Target directory containing src folder
 */
async function replaceSrcWithTemplate(template, targetDir) {
  console.log(
    chalk.cyan.bold(
      `\nReplacing src directory with selected template in ${targetDir}...`
    )
  );
  try {
    const srcPath = path.join(targetDir, "src");
    await fs.remove(srcPath);
    console.log(
      chalk.yellow.bold(`✔️ Removed existing src directory in ${targetDir}.`)
    );

    await generateStructure(template, targetDir);
    console.log(
      chalk.green.bold(
        `✔️ src directory replaced successfully in ${targetDir}!`
      )
    );
  } catch (error) {
    handleError(error, "Error replacing src directory");
  }
}

// CI/CD Configuration
const CI_CONFIGS = {
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
      run: npm test`,
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
    - main`,
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

workflows:
  version: 2
  build_test_deploy:
    jobs:
      - build
      - test:
          requires:
            - build`,
  },
};

/**
 * Generate CI/CD configuration files for specified provider
 * @param {string} provider - CI/CD provider name (github-actions, gitlab-ci, circle-ci)
 * @param {string} targetDir - Target directory for config files
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function generateCIConfig(provider, targetDir) {
  try {
    const config = CI_CONFIGS[provider];
    if (!config) {
      console.error(chalk.red.bold(`❌ Unsupported CI provider: ${provider}`));
      console.log(
        chalk.yellow(
          `Supported providers: ${Object.keys(CI_CONFIGS).join(", ")}`
        )
      );
      return false;
    }

    for (const [filePath, content] of Object.entries(config)) {
      const fullPath = path.join(targetDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
      console.log(chalk.blue.bold(`✅ Created CI config: ${filePath}`));
    }

    return true;
  } catch (error) {
    handleError(error, `Error generating ${provider} configuration`);
    return false;
  }
}

/**
 * Load existing configuration or create a new one with defaults
 * @param {string} configPath - Path to configuration file
 * @returns {Promise<Object>} Configuration object
 */
async function loadOrCreateConfig(configPath) {
  try {
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
    const defaultConfig = {
      version: "1.0.0",
      template: null,
      features: ["responsive", "seo"],
      plugins: [],
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    return defaultConfig;
  } catch (error) {
    handleError(error, "Error loading configuration");
  }
}

/**
 * Save configuration to file with timestamp
 * @param {string} configPath - Path to save configuration
 * @param {Object} config - Configuration object to save
 */
async function saveConfig(configPath, config) {
  try {
    config.lastUpdated = new Date().toISOString();
    await fs.writeJson(configPath, config, { spaces: 2 });
    console.log(chalk.green.bold("✅ Configuration saved successfully"));
  } catch (error) {
    handleError(error, "Error saving configuration");
  }
}

/**
 * Check project dependencies for outdated and deprecated packages
 * @param {Object} [options={}] - Check options
 * @param {boolean} [options.force=false] - Force check, bypass cache
 * @param {boolean} [options.fix=false] - Automatically update outdated packages
 * @returns {Promise<Object>} Dependency analysis results
 */
async function checkDependencies(options = {}) {
  try {
    const cacheKey = "dependencies_check";
    const cached = cache.get(cacheKey);
    if (cached && !options.force) {
      console.log(chalk.cyan("Using cached dependency information..."));
      return cached;
    }

    const spinner = ora("Checking dependencies...").start();
    const packageJson = await fs.readJson(
      path.join(process.cwd(), "package.json")
    );
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    let outdatedCount = 0;
    let deprecatedCount = 0;
    const updates = [];
    const deprecated = [];

    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const cleanVersion = version.replace(/^[\^~]/, "");
        const { stdout } = await execPromise(
          `npm view ${name} --json`
        );
        const info = JSON.parse(stdout);
        const latestVersion =
          (info && (info["dist-tags"]?.latest || info.version)) ||
          (Array.isArray(info) ? info[0]?.version || info[0] : undefined);

        if (info.deprecated) {
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
      deprecated.forEach((dep) => {
        console.log(`- ${dep.name}@${dep.current}`);
        console.log(`  Message: ${dep.message}`);
      });
    }

    if (updates.length > 0) {
      console.log(chalk.yellow.bold("\n🔄 Available Updates:"));
      updates.forEach((update) => {
        const updateLevel =
          update.type === "major"
            ? chalk.red(update.type)
            : update.type === "minor"
            ? chalk.yellow(update.type)
            : chalk.green(update.type);
        console.log(
          `- ${update.name}: ${update.current} → ${update.latest} (${updateLevel})`
        );
      });
    }

    const results = {
      total: Object.keys(dependencies).length,
      outdated: outdatedCount,
      deprecated: deprecatedCount,
      updates,
      deprecated,
      lastChecked: new Date().toISOString(),
    };

    cache.set(cacheKey, results);

    if (options.fix && (outdatedCount > 0 || deprecatedCount > 0)) {
      const shouldFix = await promptUser(
        "confirm",
        null,
        "Do you want to update the outdated dependencies?",
        true
      );

      if (shouldFix) {
        const fixSpinner = ora("Updating dependencies...").start();
        try {
          await execPromise("npx npm-check-updates -u");
          await execPromise("npm install");
          fixSpinner.succeed("Dependencies updated successfully!");
        } catch (error) {
          fixSpinner.fail("Failed to update dependencies");
          console.error(chalk.red(error.message));
        }
      }
    }

    return results;
  } catch (error) {
    handleError(error, "Error checking dependencies");
  }
}

/**
 * Generate a React component with TypeScript
 * @param {string} componentName - Name of the component to generate
 * @param {string[]} [props=[]] - Array of prop names for the component
 * @param {string} [targetDir=process.cwd()] - Target directory for component
 */
async function generateComponent(
  componentName,
  props = [],
  targetDir = process.cwd()
) {
  try {
    const componentDir = path.join(targetDir, "components");
    await fs.ensureDir(componentDir);

    const propsInterface =
      props.length > 0
        ? `\ninterface ${componentName}Props {\n  ${props
            .map((prop) => `${prop}?: any;`)
            .join("\n  ")}\n}\n`
        : "";

    const propsCode =
      props.length > 0
        ? `\n  ${props.map((prop) => `${prop}: any,`).join("\n  ")}`
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
}`;

    const componentPath = path.join(componentDir, `${componentName}.tsx`);
    await createFileWithContent(componentPath, componentTemplate);

    console.log(
      chalk.green.bold(`✅ Component ${componentName} created successfully`)
    );
  } catch (error) {
    handleError(error, `Error generating component ${componentName}`);
  }
}

/**
 * Generate Next.js API routes with CRUD operations
 * @param {string[]} [routes=[]] - Array of route names to generate
 * @param {string} [targetDir=process.cwd()] - Target directory for API routes
 */
async function generateApiRoutes(routes = [], targetDir = process.cwd()) {
  try {
    const apiDir = path.join(targetDir, "app/api");
    await fs.ensureDir(apiDir);

    for (const route of routes) {
      const routeDir = path.join(apiDir, route);
      await fs.ensureDir(routeDir);

      const routeTemplate = `import { NextRequest, NextResponse } from 'next/server';

const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const responses = {
  GET: () => NextResponse.json({ message: '${route} fetched successfully', data: [] }),
  POST: async (request) => {
    const body = await request.json();
    return NextResponse.json({ message: '${route} created successfully', data: body });
  },
  PUT: async (request) => {
    const body = await request.json();
    return NextResponse.json({ message: '${route} updated successfully', data: body });
  },
  DELETE: () => NextResponse.json({ message: '${route} deleted successfully' })
};

${methods
  .map(
    (method) => `
export async function ${method}(request: NextRequest) {
  try {
    return await responses.${method}(request);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to ${method.toLowerCase()} ${route}' },
      { status: 500 }
    );
  }
}`
  )
  .join("")}`;

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

/**
 * Install a FileGen plugin from npm
 * @param {string} pluginName - Name of the plugin to install
 * @param {string} targetDir - Target directory for plugin installation
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function installPlugin(pluginName, targetDir) {
  try {
    const spinner = ora(`Installing plugin: ${pluginName}...`).start();
    await fs.ensureDir(CONFIG.PLUGINS_DIR);

    const npmPluginName = `@ubaton/filegen-plugin-${pluginName}`;
    await runCommand(`npm view ${npmPluginName} --json`);
    await runCommand(`npm install ${npmPluginName} --save`, { cwd: targetDir });

    spinner.succeed(`Plugin '${pluginName}' installed successfully!`);
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Failed to install plugin: ${pluginName}`));
    console.error(chalk.red(error.message));
    return false;
  }
}

// Command definitions
program
  .version(CONFIG.VERSION)
  .description("Generate file structures from templates")
  .option("-t, --template <template>", "Template name to generate")
  .option("-f, --features <features>", "Comma-separated features to include")
  .option("-p, --plugins <plugins>", "Comma-separated plugins to include")
  .option("-c, --config <config>", "Path to configuration file")
  .option("--ci <provider>", "CI/CD provider to configure")
  .option("--skip-dep-check", "Skip checking for deprecated dependencies")
  .action(async (options) => {
    try {
      // Check dependencies unless skipped
      if (!options.skipDepCheck) {
        try {
          const depResults = await checkDependencies({ fix: false });
          if (depResults?.deprecated > 0) {
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

      // Load configuration
      let config = {};
      if (options.config) {
        const configPath = path.resolve(process.cwd(), options.config);
        if (await fs.pathExists(configPath)) {
          config = await fs.readJson(configPath);
          console.log(
            chalk.cyan(`📄 Using configuration from: ${options.config}`)
          );
        }
      }

      // Get template, features, and plugins
      const template =
        options.template ||
        config.template ||
        (await promptUser("list", TEMPLATES, "Select a template to generate:"));

      // Validate template
      const validTemplates = TEMPLATES.map((t) => t.value);
      if (!validTemplates.includes(template)) {
        console.error(
          chalk.red.bold(
            `❌ Invalid template: "${template}". Available templates: ${validTemplates.join(", ")}`
          )
        );
        process.exit(1);
      }

      const features = options.features
        ? options.features.split(",")
        : config.features ||
          (await promptUser(
            "checkbox",
            FEATURES,
            "Select features to include:",
            ["responsive", "seo"]
          ));

      const plugins = options.plugins
        ? options.plugins.split(",")
        : config.plugins || [];

      // Install dependencies and setup project
      const initialProjectPath = process.cwd();
      const {
        projectPath: finalProjectPath,
        packageManager,
        isNewDirectory,
      } = await installDependencies(template, initialProjectPath);

      await replaceSrcWithTemplate(template, finalProjectPath);

      // Install plugins if any
      if (plugins.length > 0) {
        console.log(
          chalk.cyan.bold(`\n📦 Installing plugins: ${plugins.join(", ")}...`)
        );
        for (const plugin of plugins) {
          await installPlugin(plugin, finalProjectPath);
        }
      }

      // Generate CI/CD config if requested
      if (options.ci) {
        console.log(
          chalk.cyan.bold(`\n🚀 Configuring CI/CD with ${options.ci}...`)
        );
        await generateCIConfig(options.ci, finalProjectPath);
      }

      // Save configuration
      const configPath = path.join(finalProjectPath, CONFIG.FILE_NAME);
      await saveConfig(configPath, {
        template,
        features,
        plugins,
        version: CONFIG.VERSION,
        lastUpdated: new Date().toISOString(),
      });

      const startCommands = {
        bunx: "bun run dev",
        npx: "npm run dev",
        yarn: "yarn dev",
        pnpm: "pnpm dev",
      };

      console.log(chalk.green.bold("\n🎉 Setup completed successfully!"));
      if (isNewDirectory) {
        console.log(
          chalk.cyan.bold(
            `\nProject created in ${finalProjectPath}. Please cd into that directory to start the server.`
          )
        );
      }
      console.log(
        chalk.cyan.bold(`\n🚀 Starting the server with ${packageManager}...`)
      );
      await runCommand(startCommands[packageManager], { cwd: finalProjectPath });
    } catch (error) {
      handleError(error, "Error during setup");
    }
  });

// Add additional commands
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

program.parse(process.argv);
