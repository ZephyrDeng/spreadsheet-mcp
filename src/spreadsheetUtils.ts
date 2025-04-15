import fs from "fs";
import path from "path";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx"; // 仅用于读取

/**
 * 解析 CSV 或 XLSX 文件，返回统一的数据结构
 */
export function parseSpreadsheet(filePath: string): { headers: string[]; data: Record<string, any>[] } {
    if (!fs.existsSync(filePath)) {
        throw new Error("文件不存在：" + filePath);
    }
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".csv") {
        const content = fs.readFileSync(filePath, "utf-8");
        const result = Papa.parse(content, { header: true, skipEmptyLines: true });
        if (result.errors.length > 0) {
            throw new Error("CSV 解析错误：" + result.errors[0].message);
        }
        const data = result.data as Record<string, any>[];
        const headers = result.meta.fields || (data.length > 0 ? Object.keys(data[0]) : []);
        return { headers, data };
    } else if (ext === ".xlsx" || ext === ".xls") {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        return { headers, data };
    } else {
        throw new Error("仅支持 CSV 或 XLSX 文件");
    }
}

/**
 * 获取表格的行数和列数
 */
export function getFileInfo(filePath: string): { rowCount: number; colCount: number; headers: string[] } {
    const { headers, data } = parseSpreadsheet(filePath);
    return { rowCount: data.length, colCount: headers.length, headers };
}

/**
 * 获取表格前 numRows 行数据
 */
export function getPreview(filePath: string, numRows: number = 10): { headers: string[]; data: Record<string, any>[] } {
    const { headers, data } = parseSpreadsheet(filePath);
    return { headers, data: data.slice(0, numRows) };
}

/**
 * 按条件筛选数据
 */
export function filterData(
    filePath: string,
    column: string,
    operator: string,
    value: any,
    numRows: number = 10
): { headers: string[]; data: Record<string, any>[] } {
    const { headers, data } = parseSpreadsheet(filePath);
    let filtered = data.filter(row => {
        const cell = row[column];
        switch (operator) {
            case "eq": return cell == value;
            case "neq": return cell != value;
            case "gt": return Number(cell) > Number(value);
            case "lt": return Number(cell) < Number(value);
            case "gte": return Number(cell) >= Number(value);
            case "lte": return Number(cell) <= Number(value);
            case "contains": return typeof cell === "string" && cell.includes(String(value));
            default: return false;
        }
    });
    return { headers, data: filtered.slice(0, numRows) };
}

/**
 * 按列排序数据
 */
export function sortData(
    filePath: string,
    column: string,
    order: "asc" | "desc" = "asc",
    numRows: number = 10
): { headers: string[]; data: Record<string, any>[] } {
    const { headers, data } = parseSpreadsheet(filePath);
    const sorted = [...data].sort((a, b) => {
        const va = a[column];
        const vb = b[column];
        if (typeof va === "number" && typeof vb === "number") {
            return order === "asc" ? va - vb : vb - va;
        }
        return order === "asc"
            ? String(va).localeCompare(String(vb), undefined, { numeric: true })
            : String(vb).localeCompare(String(va), undefined, { numeric: true });
    });
    return { headers, data: sorted.slice(0, numRows) };
}

/**
 * 将数据格式化为 Markdown 表格字符串
 */
export function formatToMarkdownTable(headers: string[], data: Record<string, any>[]): string {
    if (headers.length === 0) return "（无数据）";
    const headerRow = "| " + headers.join(" | ") + " |";
    const sepRow = "| " + headers.map(() => "---").join(" | ") + " |";
    const dataRows = data.map(row =>
        "| " + headers.map(h => String(row[h] ?? "")).join(" | ") + " |"
    );
    return [headerRow, sepRow, ...dataRows].join("\n");
}

/**
 * 向指定 xlsx 文件添加新 sheet 并写入数据（如文件不存在则新建）
 * @param filePath xlsx 文件路径
 * @param sheetName 新 sheet 名称
 * @param headers 表头数组
 * @param data 数据数组（每项为对象）
 */
/**
 * 用 exceljs 向指定 xlsx 文件添加新 sheet 并写入数据，支持样式
 * @param filePath xlsx 文件路径
 * @param sheetName 新 sheet 名称
 * @param headers 表头数组
 * @param data 数据数组（每项为对象）
 * @param options 样式选项（headerStyle, rowStyle, border）
 */
export async function addSheetToXlsx(
    filePath: string,
    sheetName: string,
    headers: string[],
    data: Record<string, any>[],
    options?: {
        headerStyle?: any,
        rowStyle?: any[],
        border?: any
    }
): Promise<void> {
    const Excel = ExcelJS;
    let workbook = new Excel.Workbook();
    if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
    }
    // 若 sheetName 已存在则删除
    const oldSheet = workbook.getWorksheet(sheetName);
    if (oldSheet) workbook.removeWorksheet(oldSheet.id);

    const worksheet = workbook.addWorksheet(sheetName);

    // 写 header
    worksheet.addRow(headers);
    if (options?.headerStyle) {
        headers.forEach((h, idx) => {
            const cell = worksheet.getRow(1).getCell(idx + 1);
            Object.assign(cell, { style: options.headerStyle });
        });
    }

    // 写数据
    data.forEach((row, rowIdx) => {
        const rowArr = headers.map(h => {
            const cell = row[h];
            if (cell && typeof cell === "object" && (cell.value !== undefined || cell.formula || cell.style)) {
                return cell.value !== undefined ? cell.value : "";
            } else if (cell !== undefined) {
                return cell;
            } else {
                return "";
            }
        });
        worksheet.addRow(rowArr);
    });

    // 应用样式、公式、边框
    data.forEach((row, rowIdx) => {
        const excelRow = worksheet.getRow(rowIdx + 2);
        headers.forEach((h, colIdx) => {
            const cellData = row[h];
            const cell = excelRow.getCell(colIdx + 1);
            // 公式
            if (cellData && typeof cellData === "object" && cellData.formula) {
                cell.value = { formula: cellData.formula, result: cellData.value ?? null };
            }
            // 单元格样式
            if (cellData && typeof cellData === "object" && cellData.style) {
                Object.assign(cell, { style: cellData.style });
            }
            // 行样式
            if (options?.rowStyle && options.rowStyle.length > 0) {
                const styleIdx = rowIdx % options.rowStyle.length;
                Object.assign(cell, { style: { ...cell.style, ...options.rowStyle[styleIdx] } });
            }
            // 边框
            if (options?.border) {
                cell.border = options.border;
            }
        });
    });

    // 保存
    await workbook.xlsx.writeFile(filePath);
}