import { test, expect, beforeEach, afterEach } from 'bun:test';
import mockFromYaml from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const testDir = path.join(import.meta.dirname, 'test-data');

beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
});

afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
});

test('从有效的 YAML 文件生成模拟数据', async () => {
    const yamlContent = `
name: '@cname'
age: '@integer(18, 60)'
email: '@email'
`;

    const filepath = path.join(testDir, 'valid.yaml');
    await fs.writeFile(filepath, yamlContent, 'utf-8');

    const result = await mockFromYaml(filepath);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('age');
    expect(result).toHaveProperty('email');
    expect(typeof result.name).toBe('string');
    expect(typeof result.age).toBe('number');
    expect(typeof result.email).toBe('string');
});

test('文件不存在时抛出错误', async () => {
    const filepath = path.join(testDir, 'nonexistent.yaml');

    await expect(mockFromYaml(filepath)).rejects.toThrow('File not found');
});

test('无效的 YAML 内容抛出错误', async () => {
    const invalidYaml = `
name: @cname
age: 25
`;

    const filepath = path.join(testDir, 'invalid.yaml');
    await fs.writeFile(filepath, invalidYaml, 'utf-8');

    await expect(mockFromYaml(filepath)).rejects.toThrow('YAML parsing error');
});

test('空对象模板抛出错误', async () => {
    const emptyYaml = '';

    const filepath = path.join(testDir, 'empty.yaml');
    await fs.writeFile(filepath, emptyYaml, 'utf-8');

    await expect(mockFromYaml(filepath)).rejects.toThrow('Invalid YAML template: must be an object');
});
