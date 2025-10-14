# Contributing to FileGen

Thank you for considering contributing to FileGen! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (OS, Node version, package manager)

### Suggesting Enhancements

We welcome suggestions! Please create an issue with:
- A clear description of the enhancement
- Use cases and examples
- Why this would be useful to users

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add JSDoc comments for new functions
   - Keep changes focused and minimal

3. **Test your changes**
   ```bash
   # Test the CLI
   node index.js --help
   node index.js --version
   
   # Check for unused dependencies
   npm run check-deps
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of changes"
   ```
   
   Use conventional commit prefixes:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Docs:` for documentation changes
   - `Refactor:` for code refactoring
   - `Test:` for test additions/changes

5. **Push to your fork and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ features (import/export, async/await, etc.)
- Use meaningful variable and function names
- Add JSDoc comments for functions and classes
- Follow existing formatting patterns

### Documentation
- Keep README.md up to date
- Add examples for new features
- Update CHANGELOG.md for notable changes

## 🧪 Testing

Before submitting a PR:

1. Test the basic commands:
   ```bash
   node index.js --help
   node index.js --template e-commerce
   node index.js component TestComponent --props title,content
   ```

2. Check for dependency issues:
   ```bash
   npm run check-deps
   ```

3. Verify no unused dependencies:
   ```bash
   npx depcheck
   ```

## 🔍 Code Review Process

1. All PRs require review before merging
2. Address reviewer feedback promptly
3. Keep PR scope focused and minimal
4. Update documentation as needed

## 📋 Adding New Templates

To add a new template:

1. Add template structure to `structures.js`
2. Add template to `TEMPLATES` array in `index.js`
3. Document the template in `README.md`
4. Test template generation

## 🎯 Development Setup

```bash
# Clone the repository
git clone https://github.com/Ubaton/filegen-package.git
cd filegen-package

# Install dependencies
npm install

# Test locally
node index.js --help
```

## 📞 Questions?

Feel free to:
- Open an issue for questions
- Reach out via [GitHub Discussions](https://github.com/Ubaton/filegen-package/discussions)
- Contact the maintainer: Raymond Ngobeni

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FileGen! 🎉
