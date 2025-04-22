<!-- 添加语言切换链接 -->
**English** | [中文](./README.md)

# Spreadsheet MCP Server (@zephyr-mcp/spreadsheet)

A TypeScript-based Model Context Protocol (MCP) server for viewing, filtering, sorting, and updating CSV/XLSX spreadsheet files via LLM or API integration.

## Features

- View spreadsheet info and preview rows
- Filter rows by column and condition
- Sort rows by column (ascending/descending)
- Add new sheets to existing XLSX files or create new ones
- Supports both CSV and XLSX files
- Returns results as a JSON string containing a 2D array (for viewing/filtering/sorting)
- TypeScript, fastmcp, papaparse, xlsx, zod

## Installation & Usage

This package is designed to be run directly using `npx`. No installation is required for typical use.

### Prerequisites

- Node.js v18+ (LTS recommended)

### Running the MCP Server

To start the server in stdio mode (for integration with tools like Cline):

```bash
npx @zephyr-mcp/spreadsheet
```

The server will start and listen for MCP commands via standard input/output.

## Development

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/spreadsheet-mcp.git # Replace with your repo URL
    cd spreadsheet-mcp
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running in Development

For development with hot reload using `tsx`:

```bash
npm run dev
```

### Building

To compile TypeScript to JavaScript using Vite (output to `dist/`):

```bash
npm run build
```

### Testing

Run tests using Vitest:

```bash
# Run all tests once with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

## Releasing (for Maintainers)

This project uses [`release-it`](https://github.com/release-it/release-it) to automate the release process, including version bumping, Changelog generation, Git tagging, npm publishing, and creating GitHub Releases.

**Prerequisites for Releasing:**

*   Ensure you have push access to the repository.
*   Ensure you have publish access to the `@zephyr-mcp` scope on npm.
*   Configure necessary secrets in the GitHub repository if running release from CI (e.g., `NPM_TOKEN`, potentially a `PAT_TOKEN` for GitHub Release creation if default token permissions are insufficient).

**Steps:**

1.  Ensure your local `main` branch is up-to-date and the working directory is clean.
2.  Make sure all changes intended for the release are merged into `main`.
3.  Run the release command:
    ```bash
    npm run release
    ```
4.  `release-it` will guide you through the process:
    *   It will determine the next version based on Conventional Commits.
    *   It will run tests (`npm test`) and build (`npm run build`) via configured hooks.
    *   It will update `CHANGELOG.md`.
    *   It will commit the changes (`package.json`, `CHANGELOG.md`).
    *   It will create a Git tag.
    *   It will push the commit and tag to the remote repository.
    *   It will publish the package to npm.
    *   It will create a GitHub Release.

## Contributing

Contributions are welcome! Please follow these guidelines:

1.  **Branching:** Create a new branch for your feature or bug fix.
2.  **Commits:** Follow the [**Conventional Commits**](https://www.conventionalcommits.org/) specification for your commit messages. This is crucial for automated Changelog generation and version bumping by `release-it`.
3.  **Code Style:** Maintain consistent code style (consider adding a linter like ESLint).
4.  **Testing:** Add tests for new features or bug fixes in the `tests/` directory. Ensure all tests pass (`npm test`).
5.  **Pull Request:** Submit a pull request to the `main` branch.

## Project Structure

```
.
├── .github/workflows/       # GitHub Actions workflows (CI)
│   └── ci.yml
├── dist/                    # Compiled JavaScript output (ignored by Git)
├── node_modules/            # Dependencies (ignored by Git)
├── src/                     # Source code
│   ├── server.ts            # MCP server entry, tool registration
│   └── spreadsheetUtils.ts  # Spreadsheet parsing, filtering, formatting, writing
├── tests/                   # Unit/Integration tests
│   └── server.test.ts
├── .gitattributes
├── .gitignore
├── .release-it.json         # release-it configuration
├── CHANGELOG.md             # Auto-generated changelog
├── LICENSE
├── package.json
├── README.md                # This documentation (Chinese)
├── README.en.md             # English documentation
├── tsconfig.json
└── vite.config.ts           # Vite & Vitest configuration
```

## Example Tools

- `view_spreadsheet`: View file info and preview a specified number of rows. Returns a JSON string containing file info and preview data (2D array). The `rows` parameter specifies the number of rows to preview (0 for headers only, defaults to 10, no max limit).
- `filter_spreadsheet`: Filter rows by column and condition. Returns a JSON string containing the filtered results (2D array). The `rows` parameter specifies the maximum number of rows to return (defaults to all matching rows, no max limit).
- `sort_spreadsheet`: Sort rows by column. Returns a JSON string containing the sorted results (2D array). The `rows` parameter specifies the maximum number of rows to return (defaults to all rows, no max limit).
- `update_spreadsheet_with_new_sheet`: Write data to a new sheet in an XLSX file

## License

MIT License © 2025 Zephyr

## Author

Zephyr