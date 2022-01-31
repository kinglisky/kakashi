import * as fs from 'fs';
import * as util from 'util';

export async function exists(filePath: string): Promise<boolean> {
    const access = util.promisify(fs.access);
    return access(filePath).then(() => true).catch(() => false)
}

export const writeFile = util.promisify(fs.writeFile);