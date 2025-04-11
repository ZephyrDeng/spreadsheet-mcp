import { FastMCP, UserError } from "fastmcp";
import { z } from "zod";
import {
  getFileInfo,
  getPreview,
  filterData,
  sortData,
  formatToMarkdownTable,
} from "./spreadsheetUtils";

// 创建 MCP 服务器实例
const server = new FastMCP({
  name: "Spreadsheet MCP Server",
  version: "1.0.0",
});

// 工具 1：查看表格信息和预览
server.addTool({
  name: "view_spreadsheet",
  description: "查看表格信息和预览前 N 行",
  parameters: z.object({
    filePath: z.string(),
    rows: z.number().int().min(1).max(100).optional(),
  }),
  async execute(args) {
    try {
      const rows = args.rows ?? 10;
      const preview = getPreview(args.filePath, rows);
      const info = getFileInfo(args.filePath);
      const md = formatToMarkdownTable(preview.headers, preview.data);
      return `**文件信息**：共 ${info.rowCount} 行，${info.colCount} 列。\n\n${md}`;
    } catch (e: any) {
      throw new UserError(e.message || "读取表格失败");
    }
  },
});

// 工具 2：筛选
server.addTool({
  name: "filter_spreadsheet",
  description: "按条件筛选表格数据",
  parameters: z.object({
    filePath: z.string(),
    column: z.string(),
    operator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte", "contains"]),
    value: z.union([z.string(), z.number()]),
    rows: z.number().int().min(1).max(100).optional(),
  }),
  async execute(args) {
    try {
      const rows = args.rows ?? 10;
      const filtered = filterData(args.filePath, args.column, args.operator, args.value, rows);
      const md = formatToMarkdownTable(filtered.headers, filtered.data);
      return md;
    } catch (e: any) {
      throw new UserError(e.message || "筛选失败");
    }
  },
});

// 工具 3：排序
server.addTool({
  name: "sort_spreadsheet",
  description: "按列排序表格数据",
  parameters: z.object({
    filePath: z.string(),
    column: z.string(),
    order: z.enum(["asc", "desc"]).optional(),
    rows: z.number().int().min(1).max(100).optional(),
  }),
  async execute(args) {
    try {
      const rows = args.rows ?? 10;
      const order = args.order ?? "asc";
      const sorted = sortData(args.filePath, args.column, order, rows);
      const md = formatToMarkdownTable(sorted.headers, sorted.data);
      return md;
    } catch (e: any) {
      throw new UserError(e.message || "排序失败");
    }
  },
});

// 启动服务器
server.start({
  transportType: "stdio",
});