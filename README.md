# Spreadsheet MCP Server

A TypeScript-based Model Context Protocol (MCP) server for viewing, filtering, and sorting CSV/XLSX spreadsheet files via LLM or API integration. All operations are read-only and results are returned as Markdown tables.

## Features

- View spreadsheet info and preview the first N rows
- Filter rows by column and condition
- Sort rows by column (ascending/descending)
- Supports both CSV and XLSX files
- Returns results as Markdown tables
- TypeScript, fastmcp, papaparse, xlsx, zod

## Getting Started

### Prerequisites

- Node.js v20+ (required by fastmcp and dependencies)
- npm

### Installation

```bash
npm install
```

### Usage

Start the MCP server (stdio mode):

```bash
npm run start
```

Or for development with hot reload:

```bash
npm run dev
```

### Project Structure

```
.
├── src/
│   ├── server.ts              # MCP server entry, tool registration
│   └── spreadsheetUtils.ts    # Spreadsheet parsing, filtering, formatting
├── package.json
├── tsconfig.json
├── .gitignore
├── .gitattributes
├── LICENSE
├── README.md
└── PLAN.md
```

## Example Tools

- `view_spreadsheet`: View file info and preview rows
- `filter_spreadsheet`: Filter rows by column and condition
- `sort_spreadsheet`: Sort rows by column

## License

MIT License © 2025 Zephyr

## Author

Zephyr