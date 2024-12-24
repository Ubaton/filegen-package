<div align="center">
  <img src="https://github.com/Ubaton/filegen-package/blob/main/public/GrayFIleGen.png" alt="FileGen Logo" width="200"/>

# [FileGen](https://filegen.vercel.app/)

A powerful local file structure generator for Next.js projects with pre-configured templates.  
[Visit Website](https://filegen.vercel.app/) | [Documentation](https://filegen.vercel.app/docs) | [Report Bug](https://github.com/Ubaton/filegen-package/issues)

</div>

## ✨ Features

- 🎯 Interactive CLI interface for easy template selection
- 📦 Pre-configured Next.js + TypeScript + Tailwind CSS setup
- 🚀 Multiple project templates for different use cases
- ⚡ Quick setup with your preferred package manager
- 🎨 Modern and responsive design patterns
- 🛠️ Best practices and optimized project structure

## 🔧 Prerequisites

- Node.js 16.x or later
- npm, yarn, pnpm, or bun package manager
- Basic knowledge of Next.js and React

## 📦 Installation

You can install FileGen globally using any of these package managers:

```bash
# Using npm
npm install -g filegen

# Using yarn
yarn global add filegen

# Using pnpm
pnpm add -g filegen

# Using bun
bun add -g filegen
```

## 🚀 Usage

### Interactive Mode

Start the interactive CLI to choose your template:

```bash
filegen
```

Follow the prompts to:

1. Select your preferred template
2. Choose your package manager
3. Configure project settings

### Direct Template Selection

Generate a project with a specific template:

```bash
filegen --template <template-name>

# Example
filegen --template e-commerce
```

## 📚 Available Templates

### 1. E-commerce Store

A complete e-commerce solution featuring:

- 🛍️ Product catalog with filtering and search
- 🛒 Shopping cart with persistent storage
- 💳 Checkout process integration
- 📱 Responsive product galleries
- 🔐 User authentication and profiles

### 2. Blog Platform

Modern blogging platform with:

- ✍️ Markdown support for content
- 🏷️ Categories and tags system
- 👥 Multi-author capabilities
- 🔍 Full-text search
- 📊 Analytics integration

### 3. Tech Website

Professional tech website template with:

- 🎨 Modern landing page design
- 📱 Responsive components
- 📬 Contact form integration
- 🔍 SEO optimization

### 4. Portfolio

Personal portfolio template featuring:

- 🖼️ Project showcase gallery
- 💪 Skills section
- 📝 Blog integration
- 📱 Mobile-first design

### 5. SaaS Platform

Complete SaaS starter with:

- 🔐 Authentication system
- 💼 Admin dashboard
- 👥 User management
- 💳 Subscription handling

### 6. Community Forum

Interactive forum platform with:

- 💬 Discussion boards
- 👤 User profiles
- 🔔 Notification system
- 🔍 Advanced search

### 7. Learning Management

E-learning platform featuring:

- 📚 Course organization
- 📊 Progress tracking
- 📝 Assessment tools
- 👨‍🏫 Instructor dashboard

### 8. News Portal

News website template with:

- 📰 Article layouts
- 🏷️ Category system
- 🔍 Search functionality
- 📱 Responsive design

## 🎯 Interactive Selection

When you run `filegen` without any arguments, you'll be presented with an interactive CLI interface:

1. **Template Selection**

```
Select a template to generate:
▶ 🛒 E-commerce Store
  ✍️ Blog Platform
  💻 Tech Website
  📁 Portfolio
  🚀 SaaS Platform
  👥 Community Forum
  📚 Learning Management System
  📰 News Portal

[↑↓] Navigate
[Enter] Select template
```

2. **Package Manager Selection**

```
Choose a package manager to use:
▶ bunx
  npx
  yarn
  pnpm
```

3. **Project Setup**

- Creates a new Next.js project with:
  - TypeScript configuration
  - Tailwind CSS setup
  - ESLint integration
- Installs template-specific dependencies
- Generates the file structure based on your selected template

4. **Post-Installation**
   Once completed, you can start your development server:

```bash
# Start the development server
bun dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

[MIT](https://opensource.org/licenses/MIT)

---

<div align="center">
  Made with ❤️ by Raymond Ngobeni
  
  [GitHub](https://github.com/Ubaton) | [Twitter](https://x.com/_GoldManRay) | [LinkedIn](https://www.linkedin.com/in/raymond-ngobeni-b7ab26163/)
</div>
