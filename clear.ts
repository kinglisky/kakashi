import findRemoveSync from 'find-remove';
import { join } from 'path';

(async function () {
    findRemoveSync(join(__dirname, './cache'), { dir: '*', files: '*.*' });
    console.log('remove cache success!');
    findRemoveSync(join(__dirname, './useful'), { extensions: ['.mp4'] });
    console.log('remove useful video success!');
})();
