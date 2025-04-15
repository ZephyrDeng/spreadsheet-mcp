import { describe, it, expect } from 'vitest';
import { formatToMarkdownTable } from '../src/spreadsheetUtils'; // 导入要测试的函数

// 测试套件：spreadsheetUtils
describe('Spreadsheet Utils Tests', () => {

  // 测试 formatToMarkdownTable 函数
  describe('formatToMarkdownTable', () => {
    it('should format basic data correctly', () => {
      const headers = ['ID', 'Name', 'Value'];
      const data = [
        { ID: 1, Name: 'Apple', Value: 10 },
        { ID: 2, Name: 'Banana', Value: 20 },
      ];
      const expected = `| ID | Name | Value |
| --- | --- | --- |
| 1 | Apple | 10 |
| 2 | Banana | 20 |`;
      expect(formatToMarkdownTable(headers, data)).toBe(expected);
    });

    it('should handle empty data', () => {
      const headers = ['Col1', 'Col2'];
      const data: Record<string, any>[] = [];
      const expected = `| Col1 | Col2 |
| --- | --- |`;
      expect(formatToMarkdownTable(headers, data)).toBe(expected);
    });

    it('should handle empty headers and data', () => {
      const headers: string[] = [];
      const data: Record<string, any>[] = [];
      const expected = '（无数据）'; // 根据函数实现
      expect(formatToMarkdownTable(headers, data)).toBe(expected);
    });

    it('should handle missing values', () => {
      const headers = ['A', 'B'];
      const data = [
        { A: 1, B: 'one' },
        { A: 2 }, // B is missing
        { B: 'three' }, // A is missing
      ];
      const expected = `| A | B |
| --- | --- |
| 1 | one |
| 2 |  |
|  | three |`;
      expect(formatToMarkdownTable(headers, data)).toBe(expected);
    });

    it('should handle different data types', () => {
        const headers = ['String', 'Number', 'Boolean', 'Null', 'Undefined'];
        const data = [
            { String: 'hello', Number: 123, Boolean: true, Null: null, Undefined: undefined },
        ];
        const expected = `| String | Number | Boolean | Null | Undefined |
| --- | --- | --- | --- | --- |
| hello | 123 | true |  |  |`; // null 和 undefined 都会被转换为空字符串
        expect(formatToMarkdownTable(headers, data)).toBe(expected);
    });
  });

  // TODO: 在这里为其他 spreadsheetUtils 函数添加测试用例
  // 例如：测试 parseSpreadsheet (可能需要模拟 fs)
  // 例如：测试 filterData 和 sortData (需要准备测试文件或模拟数据)
});