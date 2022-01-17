const path = require('path');
const fs = require('fs');
const util = require('util');
const {
    FFCreatorCenter,
    FFScene,
    FFImage,
    FFText,
    FFCreator,
} = require('ffcreatorlite');

const writeFile = util.promisify(fs.writeFile);
const resolve = (p) => path.join(__dirname, p);

const creator = new FFCreator({
    cacheDir: resolve('./cache'), // 缓存目录
    outputDir: resolve('./output'), // 输出目录
    output: 'test.mp4', // 输出文件名(FFCreatorCenter中可以不设)
    width: 1920, // 影片宽
    height: 1080, // 影片高
    cover: resolve('./assets/robot.jpeg'), // 设置封面
    audioLoop: true, // 音乐循环
    fps: 24, // fps
    threads: 4, // 多线程(伪造)并行渲染
    debug: false, // 开启测试模式
    defaultOutputOptions: null, // ffmpeg输出选项配置
    clarity: 'high',
});

const scene = new FFScene();
scene.setBgColor('#19d4ae'); // 设置背景色
scene.setDuration(10); // 设置停留时长
// scene.setTransition('Fat', 1.5);    // 设置过渡动画(类型, 时间)
creator.addChild(scene);

const img = new FFImage({ path: resolve('./assets/robot.jpeg') });
const imageWidht = 600;
const imageHeight = 488;

img.setXY((1920 - imageWidht) / 2, (1080 - imageHeight) / 2); // 设置位置
img.setWH(imageWidht, imageHeight); // 设置宽高
// img.addEffect('fadeInDown', 1, 1);  // 设置动画效果
scene.addChild(img);

creator.addAudio(resolve('./assets/emaru.mp3')); // 俩种配置方式
creator.start(); // 开始加工

creator.on('start', () => {
    console.log(`FFCreator start`);
});
creator.on('error', (e) => {
    console.log(`FFCreator error: `, e);
    writeFile('./error.json', JSON.stringify(e));
});
creator.on('progress', (e) => {
    console.log(`FFCreator progress: ${e.state} ${(e.percent * 100) >> 0}%`);
});
creator.on('complete', (e) => {
    console.log(
        `FFCreator completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `
    );
});
