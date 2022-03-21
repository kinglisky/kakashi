import fs from 'fs';

function randomBackgroundMusic(assetsPath: string) {
    const res = fs.readdirSync(assetsPath);
    const index = Math.floor(Math.random() * res.length);
    return res[index];
}

console.log(randomBackgroundMusic('./assets'));
