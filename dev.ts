import fs from 'fs';
import path from 'path';
import {
    fetchComments,
    downloadResources,
    filterResources,
    IFileInfo,
    IResourcesItem,
} from './src/resources';
import { convertImages, IConvertResutl } from './src/convert';
import { createViode } from './src/index';

function randomBackgroundMusic(assetsPath: string) {
    const res = fs.readdirSync(assetsPath);
    const index = Math.floor(Math.random() * res.length);
    return res[index];
}

(async function () {
    const width = 1920;
    const height = 1080;
    const comments = await fetchComments();
    const sourceItems = await downloadResources(comments);
    const filtedItems = await filterResources(sourceItems, {
        sourceDir: 'download',
        targetDir: 'useful',
    });
    // const res = await convertImages(items, {
    //     width,
    //     height,
    // });
    // console.log(items.length, res.length);
    console.log(sourceItems.length, filtedItems.length);
    // setTimeout(() => {
    //     const musicPath = randomBackgroundMusic(path.join(__dirname, './assets'));
    //     createViode(res, {
    //         width,
    //         height,
    //         output: 'output.mp4',
    //         outputDir: path.join(__dirname, './output'),
    //         cacheDir: path.join(__dirname, './cache'),
    //         fps: 60,
    //         audio: {
    //             path: musicPath,
    //         },
    //     });
    // }, 400);
})();
