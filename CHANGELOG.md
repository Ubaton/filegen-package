# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive JSDoc comments for all major functions and classes
- Input validation for templates and component names
- Graceful handling of user interruptions (Ctrl+C)
- Component name validation against JavaScript identifier rules
- Troubleshooting section in README
- Advanced usage documentation
- eslint-config-next as dev dependency

### Fixed
- Security vulnerabilities in inquirer dependency chain (3 low-severity issues)
- Typo in .gitignore ("Floders" → "Folders")
- Package name in installation instructions (@ubaton/filegen)

### Changed
- Enhanced error messages with more context and available options
- Improved README with better examples and troubleshooting guide

### Removed
- Unused `consolidate` dependency

## [2.0.10] - Previous Release

### Features
- Interactive CLI interface
- Multiple project templates (e-commerce, blog, tech website, portfolio, SaaS, community, learning, news)
- Component generation with props support
- API routes generation
- CI/CD configuration support (GitHub Actions, GitLab CI, Circle CI)
- Dependency checking and auto-update
- Plugin system support
- Configuration file support (.filegenrc.json)
