#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { structures } from "./structures.js";
import { exec } from "child_process";
import util from "util";
import ora from "ora";

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced project templates with more details
const AVAILABLE_TEMPLATES = [
  {
    name: "E-commerce Store",
    value: "e-commerce",
    description:
      "Full-featured online shopping platform with product catalog, cart, and checkout",
  },
  {
    name: "Blog Platform",
    value: "blog-post",
    description:
      "Modern blog with authentication, content management, and responsive design",
  },
  {
    name: "Tech Website",
    value: "tech-website",
    description:
      "Professional tech company website with services, portfolio, and contact sections",
  },
  {
    name: "Portfolio",
    value: "portfolio",
    description:
      "Personal showcase of projects, skills, and professional experience",
  },
  {
    name: "SaaS Platform",
    value: "saas",
    description:
      "Software as a Service application with user dashboard and subscription management",
  },
  {
    name: "Community Forum",
    value: "community",
    description:
      "Interactive forum with user profiles, messaging, and discussion boards",
  },
  {
    name: "Learning Management System",
    value: "learning",
    description:
      "Online education platform with courses, user progress tracking, and resources",
  },
  {
    name: "News Portal",
    value: "news",
    description:
      "Comprehensive news website with categories, articles, and user interactions",
  },
];

// Enhanced configuration options
const CONFIGURATION_OPTIONS = [
  {
    type: "confirm",
    name: "useAuth",
    message: "Add authentication system?",
    default: false,
  },
  {
    type: "confirm",
    name: "useDatabase",
    message: "Include database integration?",
    default: false,
  },
  {
    type: "list",
    name: "styling",
    message: "Select styling approach:",
    choices: ["Tailwind CSS", "Styled Components", "CSS Modules", "Chakra UI"],
  },
  {
    type: "confirm",
    name: "useStateManagement",
    message: "Add state management solution?",
    default: false,
  },
];

// Comprehensive error handling and logging utility
function logError(message, error) {
  console.error(chalk.red(`❌ ${message}`));
  if (error) {
    console.error(chalk.yellow("Error Details:"), error.message);
  }
  process.exit(1);
}

// Validate project name
function validateProjectName(name) {
  const validNameRegex = /^[a-z0-9-]+$/;
  return (
    validNameRegex.test(name) && !name.startsWith("-") && !name.endsWith("-")
  );
}

async function installDependencies(targetDir, options) {
  const spinner = ora("Preparing to install dependencies...").start();

  try {
    process.chdir(targetDir);

    // Define dependency groups with clear categorization
    const dependencyGroups = [
      {
        category: "Authentication",
        condition: options.useAuth,
        dependencies: ["next-auth"],
        devDependencies: [],
        prompt: "Would you like to install authentication dependencies?",
      },
      {
        category: "Database",
        condition: options.useDatabase,
        dependencies: ["prisma", "@prisma/client"],
        devDependencies: ["@types/prisma"],
        prompt: "Would you like to install database-related dependencies?",
      },
      {
        category: "Styling",
        condition: true,
        dependencies: 
          options.styling === "Styled Components" 
            ? ["styled-components"] 
            : options.styling === "Chakra UI" 
              ? ["@chakra-ui/react", "@emotion/react", "@emotion/styled", "framer-motion"]
              : [],
        devDependencies: 
          options.styling === "Styled Components" 
            ? ["@types/styled-components"] 
            : [],
        prompt: `Would you like to install ${options.styling} dependencies?`,
      },
      {
        category: "State Management",
        condition: options.useStateManagement,
        dependencies: ["zustand"],
        devDependencies: [],
        prompt: "Would you like to install state management dependencies?",
      },
    ];

    // Filter out groups that don't meet their conditions
    const filteredGroups = dependencyGroups.filter(group => group.condition);

    // Sequentially install dependencies with user confirmation
    for (const group of filteredGroups) {
      spinner.stop();

      // Ask for confirmation to install this group of dependencies
      const { confirmInstall } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmInstall",
          message: group.prompt,
          default: true,
        },
      ]);

      if (confirmInstall) {
        spinner.start(`Installing ${group.category} dependencies...`);

        // Install production dependencies
        if (group.dependencies.length > 0) {
          await execPromise(`npm install ${group.dependencies.join(" ")}`);
        }

        // Install development dependencies
        if (group.devDependencies.length > 0) {
          await execPromise(`npm install -D ${group.devDependencies.join(" ")}`);
        }

        spinner.succeed(`${group.category} dependencies installed successfully!`);
      } else {
        spinner.info(`Skipped ${group.category} dependencies installation.`);
      }
    }

    spinner.succeed("Dependency installation process completed!");
  } catch (error) {
    spinner.fail("Error during dependency installation.");
    logError("Dependency installation failed", error);
  }
}

async function installNextjs(targetDir) {
  const spinner = ora("Setting up Next.js project...").start();

  try {
    process.chdir(targetDir);

    // More comprehensive Next.js installation
    await execPromise(
      "npx create-next-app@latest . " +
        "--typescript " +
        "--tailwind " +
        "--eslint " +
        "--app " +
        "--no-git " +
        "--import-alias '@/*'"
    );

    spinner.succeed("Next.js project created successfully!");
  } catch (error) {
    spinner.fail("Next.js installation failed.");
    logError("Next.js setup error", error);
  }
}

async function replaceSourceWithTemplate(template, targetDir, options) {
  const structure = structures[template];
  if (!structure) {
    logError(`Template "${template}" not found`);
  }

  const srcDir = path.join(targetDir, "src");
  const spinner = ora("Applying project template...").start();

  try {
    // Remove existing src folder
    await fs.remove(srcDir);
    await fs.ensureDir(srcDir);

    // Recursive function to create directory structure
    async function processStructure(struct, currentPath) {
      for (const [name, content] of Object.entries(struct)) {
        const fullPath = path.join(currentPath, name);

        if (typeof content === "object") {
          if (name.endsWith("/")) {
            await fs.ensureDir(fullPath);
            await processStructure(content, fullPath);
          }
        } else {
          await fs.ensureFile(fullPath);

          // Modify content based on configuration options
          let fileContent = content || "";
          if (options.useAuth) {
            fileContent = fileContent.replace(
              "// AUTH_PLACEHOLDER",
              "// Authentication logic added"
            );
          }

          if (options.useDatabase) {
            fileContent = fileContent.replace(
              "// DB_PLACEHOLDER",
              "// Database connection established"
            );
          }

          await fs.writeFile(fullPath, fileContent);
        }
      }
    }

    await processStructure(structure, srcDir);
    spinner.succeed("Project template applied successfully!");
  } catch (error) {
    spinner.fail("Template application failed.");
    logError("Template setup error", error);
  }
}

async function promptProjectDetails() {
  try {
    // Template selection with descriptions
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "Select a Next.js template to generate:",
        choices: AVAILABLE_TEMPLATES.map((template) => ({
          name: `${template.name} - ${template.description}`,
          value: template.value,
        })),
        pageSize: 10,
      },
    ]);

    // Prompt for configuration options
    const configOptions = await inquirer.prompt([...CONFIGURATION_OPTIONS]);

    // Prompt for project name with validation
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter a project name (lowercase, no spaces):",
        default: template.replace(/\s+/g, "-").toLowerCase(),
        validate: (input) => {
          if (!validateProjectName(input)) {
            return "Project name must be lowercase, can include numbers and hyphens, and cannot start/end with a hyphen";
          }
          return true;
        },
      },
    ]);

    return {
      template,
      projectName,
      options: configOptions,
    };
  } catch (error) {
    logError("Project details selection failed", error);
  }
}

program
  .version("2.0.0")
  .description(
    chalk.cyan(
      "🚀 Next.js Project Generator - Create modern web applications with ease!"
    )
  )
  .action(async () => {
    console.log(chalk.bold.green("Welcome to the Next.js Project Generator!"));

    try {
      // Get project details
      const { template, projectName, options } = await promptProjectDetails();

      // Create project directory
      const projectDir = path.join(process.cwd(), projectName);
      await fs.ensureDir(projectDir);

      // Installation steps
      await installNextjs(projectDir);
      await replaceSourceWithTemplate(template, projectDir, options);
      await installDependencies(projectDir, options);

      // Final output
      console.log(chalk.green("\n✨ Project generated successfully! 🎉"));
      console.log(chalk.cyan("\nNext steps:"));
      console.log(
        `1. Navigate to project directory:`,
        chalk.yellow(`cd ${projectName}`)
      );
      console.log("2. Start development server:", chalk.yellow("npm run dev"));

      // Optional recommendations based on selected options
      if (options.useAuth) {
        console.log(
          chalk.yellow("💡 Tip:"),
          "Configure your authentication strategy in the auth configuration files"
        );
      }

      if (options.useDatabase) {
        console.log(
          chalk.yellow("💡 Tip:"),
          "Run prisma init and set up your database connection"
        );
      }
    } catch (error) {
      logError("Project generation failed", error);
    }
  });

program.parse(process.argv);

// Add helpful error handling for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    chalk.red("Unhandled Rejection at:"),
    promise,
    chalk.yellow("reason:"),
    reason
  );
});