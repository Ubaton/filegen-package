#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { structures } from "./structures.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVAILABLE_TEMPLATES = [
  { name: "E-commerce Store", value: "e-commerce" },
  { name: "Blog Platform", value: "blog-post" },
  { name: "Tech Website", value: "tech-website" },
  { name: "Portfolio", value: "portfolio" },
  { name: "SaaS Platform", value: "saas" },
  { name: "Community Forum", value: "community" },
  { name: "Learning Management System", value: "learning" },
  { name: "News Portal", value: "news" },
];

async function createFileWithContent(filePath, content = "") {
  await fs.ensureFile(filePath);
  if (content) {
    await fs.writeFile(filePath, content);
  }
  console.log(chalk.blue(`Created file: ${filePath}`));
}

async function generateStructure(
  template,
  extension,
  targetDir = process.cwd()
) {
  const structure = structures[template];
  if (!structure) {
    console.error(chalk.red(`Template "${template}" not found`));
    console.log(
      chalk.yellow("Available templates:"),
      AVAILABLE_TEMPLATES.map((t) => t.name).join(", ")
    );
    process.exit(1);
  }

  async function processStructure(struct, currentPath) {
    for (const [name, content] of Object.entries(struct)) {
      // Replace file extension based on user selection
      const adjustedName = name.replace(/\.(jsx|tsx)$/, `.${extension}`);
      const fullPath = path.join(currentPath, adjustedName);

      if (typeof content === "object") {
        if (adjustedName.endsWith("/")) {
          await fs.ensureDir(fullPath);
          console.log(chalk.green(`Created directory: ${fullPath}`));
          await processStructure(content, fullPath);
        }
      } else {
        await createFileWithContent(fullPath, content);
      }
    }
  }

  try {
    console.log(
      chalk.cyan(
        `\nGenerating ${template} structure with ${extension} files...\n`
      )
    );
    await processStructure(structure, targetDir);
  } catch (error) {
    console.error(chalk.red("Error generating structure:"), error);
    process.exit(1);
  }
}

async function promptOptions() {
  try {
    // Ask the user for file extension preference
    const { extension, template } = await inquirer.prompt([
      {
        type: "list",
        name: "extension",
        message: "Select the file extension for your project:",
        choices: [
          { name: "JavaScript (.jsx)", value: "jsx" },
          { name: "TypeScript (.tsx)", value: "tsx" },
        ],
      },
      {
        type: "list",
        name: "template",
        message: "Select a template to generate:",
        choices: AVAILABLE_TEMPLATES,
        pageSize: 10,
      },
    ]);
    return { extension, template };
  } catch (error) {
    console.error(chalk.red("Error during options selection:"), error);
    process.exit(1);
  }
}

program
  .version("1.0.0")
  .description("Generate file structures from templates")
  .option("-t, --template <template>", "Template name to generate")
  .option("-e, --extension <extension>", "File extension to use (.jsx or .tsx)")
  .action(async (options) => {
    try {
      // Prompt for extension and template if not provided as options
      const { extension, template } =
        options.extension && options.template
          ? { extension: options.extension, template: options.template }
          : await promptOptions();

      await generateStructure(template, extension);
      console.log(chalk.green("\nFile structure generated successfully! 🎉"));
      console.log(chalk.cyan("\nNext steps:"));
      console.log("1. Install dependencies:", chalk.yellow("npm install"));
      console.log("2. Start development server:", chalk.yellow("npm run dev"));
    } catch (error) {
      console.error(chalk.red("Error generating structure:"), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
