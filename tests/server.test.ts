import { describe, it, expect } from 'vitest';
import { formatToJsonArray } from '../src/spreadsheetUtils'; // 导入新的函数

// 测试套件：spreadsheetUtils
describe('Spreadsheet Utils Tests', () => {

  // 测试 formatToJsonArray 函数
  describe('formatToJsonArray', () => {
    it('should format basic data correctly', () => {
      const headers = ['ID', 'Name', 'Value'];
      const data = [
        { ID: 1, Name: 'Apple', Value: 10 },
        { ID: 2, Name: 'Banana', Value: 20 },
      ];
      // 期望输出：包含表头和数据行的二维数组
      const expected = [
        ['ID', 'Name', 'Value'],
        [1, 'Apple', 10],
        [2, 'Banana', 20],
      ];
      expect(formatToJsonArray(headers, data)).toEqual(expected); // 使用 toEqual 进行深度比较
    });

    it('should handle empty data', () => {
      const headers = ['Col1', 'Col2'];
      const data: Record<string, any>[] = [];
      // 期望输出：只包含表头行的二维数组
      const expected = [
        ['Col1', 'Col2'],
      ];
      expect(formatToJsonArray(headers, data)).toEqual(expected);
    });

    it('should handle empty headers and data', () => {
      const headers: string[] = [];
      const data: Record<string, any>[] = [];
      // 期望输出：空数组
      const expected: any[][] = [];
      expect(formatToJsonArray(headers, data)).toEqual(expected);
    });

     it('should handle empty headers but with data', () => {
        const headers: string[] = [];
        const data = [{ A: 1, B: 'one' }, { A: 2, B: 'two' }];
        // 期望输出：根据第一行数据推断表头
        const expected = [
            ['A', 'B'],
            [1, 'one'],
            [2, 'two'],
        ];
        expect(formatToJsonArray(headers, data)).toEqual(expected);
    });


    it('should handle missing values', () => {
      const headers = ['A', 'B'];
      const data = [
        { A: 1, B: 'one' },
        { A: 2 }, // B is missing
        { B: 'three' }, // A is missing
      ];
      // 期望输出：缺失值应表示为空字符串 ''
      const expected = [
        ['A', 'B'],
        [1, 'one'],
        [2, ''], // 缺失的 B
        ['', 'three'], // 缺失的 A
      ];
      expect(formatToJsonArray(headers, data)).toEqual(expected);
    });

    it('should handle different data types including null/undefined', () => {
        const headers = ['String', 'Number', 'Boolean', 'Null', 'Undefined'];
        const data = [
            { String: 'hello', Number: 123, Boolean: true, Null: null, Undefined: undefined },
        ];
        // 期望输出：null 和 undefined 应转换为空字符串 ''
        const expected = [
            ['String', 'Number', 'Boolean', 'Null', 'Undefined'],
            ['hello', 123, true, '', ''],
        ];
        expect(formatToJsonArray(headers, data)).toEqual(expected);
    });

    // 新增：测试 ExcelJS 超链接对象的处理
    it('should handle ExcelJS hyperlink objects', () => {
        const headers = ['Link'];
        const data = [
            { Link: { text: 'Google', hyperlink: 'https://google.com' } },
            { Link: { text: '', hyperlink: 'https://example.com' } }, // 只有链接
            { Link: { text: 'NoLink', hyperlink: undefined } }, // 只有文本
        ];
        const expected = [
            ['Link'],
            ['Google'], // 优先使用 text
            ['https://example.com'], // text 为空时使用 hyperlink
            ['NoLink'], // hyperlink 为空时使用 text
        ];
        expect(formatToJsonArray(headers, data)).toEqual(expected);
    });
  });

  // TODO: 在这里为其他 spreadsheetUtils 函数添加测试用例
  // 例如：测试 parseSpreadsheet (可能需要模拟 fs)
  // 例如：测试 filterData 和 sortData (需要准备测试文件或模拟数据)
});