import path from 'path';
import {
    fetchComments,
    downloadComments,
    IFileInfo,
    IDonwloadItem,
} from './src/resources';
import { convertImages, IConvertResutl } from './src/convert';
import { createViode } from './src/index';

(async function () {
    const comments = await fetchComments();
    console.log(comments);
    const items = await downloadComments(comments.slice(4, 10));
    const res = await convertImages(items, {
        width: 750,
        height: 1080,
    });
    console.log('done', res);
    setTimeout(() => {
        createViode(res, {
            width: 750,
            height: 1080,
            output: 'output.mp4',
            outputDir: path.join(__dirname, './output'),
            cacheDir: path.join(__dirname, './cache'),
            fps: 60,
            audio: {
                path: path.join(__dirname, './assets/test.mp3'),
            },
        });
    }, 400);
})();
