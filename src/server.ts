#!/usr/bin/env node
import { FastMCP, UserError } from "fastmcp";
import { z } from "zod";
import {
  getFileInfo,
  getPreview,
  filterData,
  sortData,
  formatToMarkdownTable,
  addSheetToXlsx,
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
    rows: z.number().int().min(1).optional(), // 移除 max(100) 限制
  }),
  async execute(args) {
    try {
      const info = await getFileInfo(args.filePath); // 先获取文件信息
      const requestedRows = args.rows ?? 10; // 获取请求的行数或默认值
      // 计算实际预览行数，不超过总行数
      const actualRows = Math.min(requestedRows, info.rowCount);
      const preview = await getPreview(args.filePath, actualRows); // 使用实际行数获取预览
      const md = formatToMarkdownTable(preview.headers, preview.data);
      // 返回信息保持不变，显示总行数
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
      const filtered = await filterData(args.filePath, args.column, args.operator, args.value, rows);
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
      const sorted = await sortData(args.filePath, args.column, order, rows);
      const md = formatToMarkdownTable(sorted.headers, sorted.data);
      return md;
    } catch (e: any) {
      throw new UserError(e.message || "排序失败");
    }
  },
});
/**
 * 工具：将更新内容写入新建 sheet
 */
server.addTool({
  name: "update_spreadsheet_with_new_sheet",
  description: "将更新内容写入指定 xlsx 文件的新建 sheet 中（如文件不存在则新建文件）",
  parameters: z.object({
    filePath: z.string().describe("xlsx 文件路径"),
    sheetName: z.string().describe("新建 sheet 的名称"),
    headers: z.array(z.string()).describe("表头数组"),
    data: z.array(z.record(z.any())).describe(
      "要写入的新数据（对象数组），支持普通值、公式、单元格个性化样式（style 字段仅作用于该单元格，优先生效）。如：{A: 1, B: {formula: '=SUM(A1:A10)'}, C: {value: 2, style: {numFmt: '0.00'}}}"
    ),
    options: z.object({
      headerStyle: z.record(z.any()).optional().describe("表头样式，结构参考 exceljs CellStyle"),
      rowStyle: z.array(z.record(z.any())).optional().describe("斑马行样式数组，结构参考 exceljs CellStyle"),
      border: z.record(z.any()).optional().describe("单元格边框样式，结构参考 exceljs Border"),
    }).optional().describe(
      "可选，表格全局/批量样式设置，支持 headerStyle（表头）、rowStyle（斑马行）、border（边框）等，结构参考 exceljs 文档。options 设置会批量应用，单元格自定义 style 优先生效。"
    ),
  }),
  async execute(args) {
    const { filePath, sheetName, headers, data, options } = args;
    try {
      await addSheetToXlsx(filePath, sheetName, headers, data, options);
      return `已写入新 sheet: ${sheetName}`;
    } catch (e: any) {
      throw new UserError("写入新 sheet 失败：" + e.message);
    }
  },
});


// 启动服务器
server.start({
  transportType: "stdio",
});