import { IConvertResutl, IViewContainer } from './convert';
const { FFCreator, FFScene, FFImage, FFVideo } = require('ffcreatorlite');

export interface ICreateOptions {
    width: number;
    height: number;
    fps: number;
    cacheDir: string;
    outputDir: string;
    output: string;
    audio: {
        path: string;
    };
}

function createImageScene(
    entry: IConvertResutl,
    viewContainer: IViewContainer
) {
    const scene = new FFScene();
    scene.setBgColor('#000000');
    const { renderArea, output } = entry;
    const x = (viewContainer.width - renderArea.width) / 2;
    const image = new FFImage({ path: output, x, y: 0 });
    let duration = 0;
    if (renderArea.height > viewContainer.height) {
        const ty = viewContainer.height - renderArea.height;
        duration = Math.ceil(ty / 100);
        image.addAnimate({
            type: 'move',
            showType: 'in',
            time: duration,
            delay: 0,
            from: { x, y: 0 },
            to: { x, y: ty },
        });
        scene.addChild(image);
    } else {
        // image.addEffect('fadeIn', 1, 1);
        duration = 2;
        scene.addChild(image);
    }

    scene.setDuration(duration);
    return scene;
}

function createVideoScene(
    entry: IConvertResutl,
    viewContainer?: IViewContainer
) {
    const { output, renderArea } = entry;
    const scene = new FFScene();
    scene.setBgColor('#000000');
    const video = new FFVideo({
        path: output,
        x: renderArea.x,
        y: renderArea.y,
        width: renderArea.width,
        height: renderArea.height,
    });
    scene.addChild(video);
    return scene;
}

function createScene(entry: IConvertResutl, viewContainer: IViewContainer) {
    const { type } = entry;
    const creaters = new Map<
        IConvertResutl['type'],
        (entry: IConvertResutl, viewContainer: IViewContainer) => any
    >([
        ['image', createImageScene],
        ['video', createVideoScene],
    ]);
    const creater = creaters.get(type);
    return creater!(entry, viewContainer);
}

export function createViode(
    entries: Array<IConvertResutl>,
    options: ICreateOptions
) {
    const { audio, ...createOptions } = options;
    const creator = new FFCreator({
        ...createOptions,
        log: true,
    });
    console.log(audio.path);
    creator.addAudio(audio.path);
    entries.forEach((entry) => {
        const scene = createScene(entry, {
            width: options.width,
            height: options.height,
        });
        creator.addChild(scene);
    });
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
}
