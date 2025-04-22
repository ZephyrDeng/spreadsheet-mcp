import fs from "fs";
import path from "path";
import Papa from "papaparse";
import ExcelJS from "exceljs"; // 使用 exceljs 进行读写

/**
 * 解析 CSV 或 XLSX 文件，返回统一的数据结构 (异步)
 */
export async function parseSpreadsheet(filePath: string): Promise<{ headers: string[]; data: Record<string, any>[] }> {
    if (!fs.existsSync(filePath)) {
        throw new Error("文件不存在：" + filePath);
    }
    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".csv") {
        // CSV 解析保持同步读取，但在异步函数中返回 Promise
        return new Promise((resolve, reject) => {
            try {
                const content = fs.readFileSync(filePath, "utf-8");
                const result = Papa.parse(content, { header: true, skipEmptyLines: true });
                if (result.errors.length > 0) {
                    return reject(new Error("CSV 解析错误：" + result.errors[0].message));
                }
                const data = result.data as Record<string, any>[];
                const headers = result.meta.fields || (data.length > 0 ? Object.keys(data[0]) : []);
                resolve({ headers, data });
            } catch (error) {
                reject(error);
            }
        });
    } else if (ext === ".xlsx" || ext === ".xls") {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.worksheets[0]; // 获取第一个工作表
            if (!worksheet) {
                throw new Error("工作簿中没有找到工作表");
            }

            let headers: string[] = [];
            const data: Record<string, any>[] = [];

            // 获取表头 (第一行)
            const headerRow = worksheet.getRow(1);
            if (headerRow.values && Array.isArray(headerRow.values)) {
                 // headerRow.values 返回的是稀疏数组，索引从 1 开始，需要处理
                 headers = headerRow.values.slice(1).map((val, index) => val ? String(val) : `Column ${index + 1}`);
            } else {
                 // 如果第一行是空的，尝试从数据推断或给默认值
                 // 这里简化处理，如果第一行无法解析则认为没有表头
                 headers = [];
            }


            // 获取数据行 (从第二行开始)
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber > 1) { // 跳过表头行
                    const rowData: Record<string, any> = {};
                    // row.values 也是稀疏数组，索引从 1 开始
                    const values = row.values as ExcelJS.CellValue[];
                    headers.forEach((header, index) => {
                        const cellValue = values[index + 1]; // 获取对应列的值
                        // 处理不同类型的值，例如公式结果、富文本等
                        if (cellValue && typeof cellValue === 'object' && 'result' in cellValue) {
                            rowData[header] = cellValue.result ?? ''; // 公式结果
                        } else if (cellValue && typeof cellValue === 'object' && 'richText' in cellValue) {
                            rowData[header] = (cellValue.richText as any[]).map(rt => rt.text).join(''); // 富文本
                        } else if (cellValue instanceof Date) {
                            // 格式化日期对象为 ISO 字符串
                            rowData[header] = cellValue.toISOString();
                        } else if (cellValue instanceof Error) {
                            // 提取错误信息
                            rowData[header] = cellValue.message;
                        } else if (typeof cellValue === 'object' && cellValue !== null && 'hyperlink' in cellValue && 'text' in cellValue) {
                            // 处理 Hyperlink 对象，格式化为 Markdown 链接
                            const link = (cellValue as ExcelJS.CellHyperlinkValue).hyperlink;
                            const text = (cellValue as ExcelJS.CellHyperlinkValue).text || link; // 如果没有文本，使用链接作为文本
                            // 确保文本和链接不为空
                            if (link) {
                                rowData[header] = `[${String(text).replace(/\|/g, '\\|')}](${link})`; // 转义文本中的 |
                            } else {
                                rowData[header] = String(text).replace(/\|/g, '\\|'); // 只有文本，转义 |
                            }
                        } else if (typeof cellValue === 'boolean') {
                            // 将布尔值转换为大写字符串
                            rowData[header] = cellValue ? 'TRUE' : 'FALSE';
                        } else {
                            // 对于其他所有情况（包括 number, string, null, undefined）
                            rowData[header] = cellValue ?? '';
                        }
                    });
                     // 只有包含实际数据的行才添加
                     if (Object.values(rowData).some(val => val !== '')) {
                        data.push(rowData);
                     }
                }
            });

             // 如果没有从第一行获取到 header，尝试从第一条数据推断
             if (headers.length === 0 && data.length > 0) {
                 headers = Object.keys(data[0]);
             }

            return { headers, data };
        } catch (error: any) {
            throw new Error(`使用 exceljs 读取 XLSX 文件失败：${error.message}`);
        }
    } else {
        throw new Error("仅支持 CSV 或 XLSX 文件");
    }
}

/**
 * 获取表格的行数和列数 (异步)
 */
export async function getFileInfo(filePath: string): Promise<{ rowCount: number; colCount: number; headers: string[] }> {
    const { headers, data } = await parseSpreadsheet(filePath); // await
    return { rowCount: data.length, colCount: headers.length, headers };
}

/**
 * 获取表格前 numRows 行数据 (异步)
 */
export async function getPreview(filePath: string, numRows: number = 10): Promise<{ headers: string[]; data: Record<string, any>[] }> {
    const { headers, data } = await parseSpreadsheet(filePath); // await
    return { headers, data: data.slice(0, numRows) };
}

/**
 * 按条件筛选数据 (异步)
 */
export async function filterData(
    filePath: string,
    column: string,
    operator: string,
    value: any,
    numRows: number = 10
): Promise<{ headers: string[]; data: Record<string, any>[] }> {
    const { headers, data } = await parseSpreadsheet(filePath); // await
    let filtered = data.filter(row => {
        const cell = row[column];
        // 确保比较前类型转换的健壮性
        const numCell = Number(cell);
        const numValue = Number(value);
        const strCell = String(cell ?? ''); // 处理 null/undefined
        const strValue = String(value ?? '');

        switch (operator) {
            case "eq": return String(cell ?? '') == String(value ?? ''); // 字符串比较或简单相等
            case "neq": return String(cell ?? '') != String(value ?? '');
            case "gt": return !isNaN(numCell) && !isNaN(numValue) && numCell > numValue;
            case "lt": return !isNaN(numCell) && !isNaN(numValue) && numCell < numValue;
            case "gte": return !isNaN(numCell) && !isNaN(numValue) && numCell >= numValue;
            case "lte": return !isNaN(numCell) && !isNaN(numValue) && numCell <= numValue;
            case "contains": return strCell.includes(strValue);
            default: return false;
        }
    });
    return { headers, data: filtered.slice(0, numRows) };
}

/**
 * 按列排序数据 (异步)
 */
export async function sortData(
    filePath: string,
    column: string,
    order: "asc" | "desc" = "asc",
    numRows: number = 10
): Promise<{ headers: string[]; data: Record<string, any>[] }> {
    const { headers, data } = await parseSpreadsheet(filePath); // await
    const sorted = [...data].sort((a, b) => {
        const va = a[column];
        const vb = b[column];
        // 尝试进行数字比较
        const numA = Number(va);
        const numB = Number(vb);

        if (!isNaN(numA) && !isNaN(numB)) {
            return order === "asc" ? numA - numB : numB - numA;
        }
        // 否则进行字符串比较
        const strA = String(va ?? '');
        const strB = String(vb ?? '');
        return order === "asc"
            ? strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' })
            : strB.localeCompare(strA, undefined, { numeric: true, sensitivity: 'base' });
    });
    return { headers, data: sorted.slice(0, numRows) };
}

/**
 * 将数据格式化为二维数组 JSON 结构
 */
export function formatToJsonArray(headers: string[], data: Record<string, any>[]): any[][] {
    if (headers.length === 0 && data.length === 0) return []; // 如果都没有，返回空数组
    const result: any[][] = [];
    // 添加表头行
    const actualHeaders = headers.length > 0 ? headers : (data.length > 0 ? Object.keys(data[0]) : []);
    if (actualHeaders.length > 0) {
        result.push(actualHeaders);
    }

    // 添加数据行
    data.forEach(row => {
        // 使用 actualHeaders 保证顺序和列数一致
        const rowValues = actualHeaders.map(header => {
            const value = row[header];
            // 确保 Hyperlink 对象被正确处理为文本或链接
            if (typeof value === 'object' && value !== null && 'hyperlink' in value && 'text' in value) {
                return (value as ExcelJS.CellHyperlinkValue).text || (value as ExcelJS.CellHyperlinkValue).hyperlink;
            }
            // 其他类型直接返回值，null/undefined 转为空字符串
            return value ?? '';
        });
        result.push(rowValues);
    });

    return result;
}


/**
 * 用 exceljs 向指定 xlsx 文件添加新 sheet 并写入数据，支持样式 (保持异步)
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
        headerStyle?: Partial<ExcelJS.Style>; // 使用类型提示
        rowStyle?: Partial<ExcelJS.Style>[]; // 使用类型提示
        border?: Partial<ExcelJS.Borders>; // 使用类型提示
    }
): Promise<void> {
    const Excel = ExcelJS; // 保持不变
    let workbook = new Excel.Workbook();
    if (fs.existsSync(filePath)) {
        try {
            await workbook.xlsx.readFile(filePath);
        } catch (error: any) {
             // 如果文件存在但无法读取（例如损坏），则创建一个新的工作簿
             console.warn(`无法读取现有文件 ${filePath}，将创建新文件。错误：${error.message}`);
             workbook = new Excel.Workbook();
        }
    }
    // 若 sheetName 已存在则删除
    const oldSheet = workbook.getWorksheet(sheetName);
    if (oldSheet) {
        workbook.removeWorksheet(oldSheet.id);
    }

    const worksheet = workbook.addWorksheet(sheetName);

    // 写 header
    worksheet.addRow(headers);
    if (options?.headerStyle) {
        worksheet.getRow(1).eachCell((cell) => {
            cell.style = { ...cell.style, ...options.headerStyle };
        });
    }

    // 写数据行并应用样式/公式
    data.forEach((row, rowIdx) => {
        const rowValues = headers.map(h => {
            const cellData = row[h];
            if (cellData && typeof cellData === 'object') {
                if ('formula' in cellData) {
                    // 返回 ExcelJS 公式对象结构
                    return { formula: cellData.formula, result: cellData.value };
                } else if ('value' in cellData) {
                    return cellData.value; // 如果是 { value: X, style: Y } 结构
                } else if ('richText' in cellData) {
                     return cellData; // 直接传递富文本对象
                }
            }
            return cellData; // 普通值
        });
        const addedRow = worksheet.addRow(rowValues);

        // 应用行样式和单元格特定样式/边框
        addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const headerName = headers[colNumber - 1];
            const cellData = row[headerName];

            // 单元格特定样式优先
            if (cellData && typeof cellData === 'object' && 'style' in cellData) {
                cell.style = { ...cell.style, ...(cellData.style as Partial<ExcelJS.Style>) };
            }
            // 应用斑马行样式 (如果单元格没有特定样式覆盖)
            else if (options?.rowStyle && options.rowStyle.length > 0) {
                const styleIdx = rowIdx % options.rowStyle.length;
                cell.style = { ...cell.style, ...options.rowStyle[styleIdx] };
            }
            // 应用边框
            if (options?.border) {
                cell.border = { ...cell.border, ...options.border };
            }
        });
    });

    // 保存
    await workbook.xlsx.writeFile(filePath);
}