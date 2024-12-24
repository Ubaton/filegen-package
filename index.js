import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { structures } from "./structures.js";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVAILABLE_TEMPLATES = [
  { name: "🛒 E-commerce Store", value: "e-commerce" },
  { name: "✍️ Blog Platform", value: "blog-post" },
  { name: "💻 Tech Website", value: "tech-website" },
  { name: "📁 Portfolio", value: "portfolio" },
  { name: "🚀 SaaS Platform", value: "saas" },
  { name: "👥 Community Forum", value: "community" },
  { name: "📚 Learning Management System", value: "learning" },
  { name: "📰 News Portal", value: "news" },
];

async function createFileWithContent(filePath, content = "") {
  await fs.ensureFile(filePath);
  if (content) {
    await fs.writeFile(filePath, content);
  }
  console.log(chalk.blue.bold(`✔️ Created file: ${filePath}`));
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
    console.error(chalk.red.bold("❌ Error generating structure:"), error);
    process.exit(1);
  }
}

async function installDependencies(template, projectPath) {
  try {
    // Check if directory exists and is not empty
    if (fs.existsSync(projectPath) && fs.readdirSync(projectPath).length > 0) {
      console.log("⚠️  Directory is not empty. Creating in a new directory...");
      // Create a temporary directory name
      projectPath = `${projectPath}-${Date.now()}`;
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    console.log("\nInstalling Next.js and Tailwind CSS...");

    // Prompt user to choose package manager
    const { packageManager } = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Choose a package manager to use:",
        choices: ["bunx", "npx", "yarn", "pnpm"],
      },
    ]);

    // Install using the selected package manager
    const installCommand = {
      bunx: `bunx create-next-app@latest ${projectPath} --typescript --tailwind --eslint`,
      npx: `npx create-next-app@latest ${projectPath} --typescript --tailwind --eslint`,
      yarn: `yarn create next-app ${projectPath} --typescript --tailwind --eslint`,
      pnpm: `pnpm create next-app ${projectPath} --typescript --tailwind --eslint`,
    };

    execSync(installCommand[packageManager], { stdio: "inherit" });

    // Additional template-specific dependencies can be installed here
    if (template === "Blog Platform") {
      console.log("\nInstalling additional blog dependencies...");
      execSync(
        `cd ${projectPath} && npm install @prisma/client @trpc/client @trpc/server`,
        {
          stdio: "inherit",
        }
      );
    }

    return projectPath; // Return the actual path used
  } catch (error) {
    console.error("❌ Error installing dependencies:", error);
    throw error;
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
    console.error(chalk.red.bold("❌ Error replacing src directory:"), error);
    process.exit(1);
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
    console.error(chalk.red.bold("❌ Error during template selection:"), error);
    process.exit(1);
  }
}

program
  .version("1.0.0")
  .description("Generate file structures from templates")
  .option("-t, --template <template>", "Template name to generate")
  .action(async (options) => {
    try {
      const template = options.template || (await promptTemplate());
      const projectPath = process.cwd();
      await installDependencies(template, projectPath);
      await replaceSrcWithTemplate(template);
      console.log(chalk.green.bold("\n🎉 Setup completed successfully!"));
      console.log(chalk.cyan.bold("\nNext steps:"));
      console.log("1. Start development server:", chalk.yellow("bun dev"));
    } catch (error) {
      console.error(chalk.red.bold("❌ Error during setup:"), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
