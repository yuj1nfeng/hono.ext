import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';





Hono.prototype.register = async function (root, prefix = '/api') {
    const abs_root = path.isAbsolute(root) ? root : path.join(process.cwd(), root);
    const files = await fs.readdir(abs_root, { withFileTypes: true, recursive: true });
    for (const file of files.filter((p) => p.isFile())) {
        const file_path = path.join(file.parentPath, file.name);
        const dir_name = path.dirname(path.relative(root, file_path));
        const pkg = await import(file_path);
        const api_path = path.join(prefix, dir_name, pkg.api_path).replaceAll('\\', '/');
        this[pkg.method](api_path, pkg.app);
        console.log(`\x1b[32m load router: ${pkg.method}\t${api_path} ✔\x1b[0m `);
    }
}

