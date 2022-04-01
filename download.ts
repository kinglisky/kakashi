import { join } from 'path';
import findRemoveSync from 'find-remove';
import shell from 'shelljs';
import { fetchComments, downloadResources } from './src/resources';

(async function () {
    shell.rm('-rf', join(__dirname, './download'));
    shell.rm('-rf', join(__dirname, './useful'));
    shell.mkdir('-p', join(__dirname, './useful'));
    const comments = await fetchComments();
    const sourceItems = await downloadResources(comments);
    console.log(sourceItems.length);
})();
