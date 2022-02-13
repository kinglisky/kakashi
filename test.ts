const path = require('path');
const {
    FFCreatorCenter,
    FFScene,
    FFImage,
    FFText,
    FFCreator,
} = require('ffcreatorlite');

const width = 1920;
const height = 1080;

// create creator instance
const creator = new FFCreator({
    cacheDir: path.join(__dirname, 'cache'),
    outputDir: path.join(__dirname, 'output'),
    output: 'output.mp4',
    width,
    height,
    fps: 60,
    log: true,
});

// create FFScene
const scene1 = new FFScene();
scene1.setBgColor('#000000');

const x = (width - 750) / 2;
const image = new FFImage({ path: './input.jpg', x, y: 0 });
image.addAnimate({
    type: 'move',
    showType: 'in',
    time: 4,
    delay: 0,
    from: { x, y: 0 },
    to: { x, y: 1080 - 1466 },
});
scene1.addChild(image);

scene1.setDuration(4);
creator.addChild(scene1);

creator.start();
creator.on('error', (e: any) => {
    console.log(`FFCreatorLite error:: \n ${e.error}`);
});
creator.on('progress', (e: any) => {
    console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
});

creator.on('complete', (e: any) => {
    console.log(
        `FFCreatorLite completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `
    );
});
