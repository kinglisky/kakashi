import fs from 'fs';
import path from 'path';
import { checkResources, IFileInfo, IResourcesItem } from './src/resources';
import { convertImages, IConvertResutl } from './src/convert';
import { createViode } from './src/index';
import resources from './resources.json';

function randomBackgroundMusic(assetsPath: string) {
    const res = fs.readdirSync(assetsPath);
    const index = Math.floor(Math.random() * res.length);
    return res[index];
}

(async function () {
    const width = 1080;
    const height = 1920;
    const checkedItems = await checkResources(resources, {
        sourceDir: 'download',
        targetDir: 'useful',
    });
    const res = await convertImages(checkedItems, {
        width,
        height,
    });
    console.log(checkedItems.length, res.length);
    setTimeout(() => {
        const musicName = randomBackgroundMusic(path.join(__dirname, './assets'));
        createViode(res, {
            width,
            height,
            output: '人类观察日记.mp4',
            outputDir: path.join(__dirname, './output'),
            cacheDir: path.join(__dirname, './cache'),
            fps: 60,
            audio: {
                path: path.join(__dirname, `./assets/${musicName}`),
                // path: path.join(__dirname, './assets/2.mp3'),
            },
        });
    }, 400);
})();
