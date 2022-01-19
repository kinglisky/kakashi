import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

export function getImageMeta(filePath: string): Promise<sharp.Metadata> {
    return sharp(filePath).metadata();
}

interface IInputOptins {
    input: {
        width: number;
        height: number;
    };
    render: {
        width: number;
        height: number;
    };
}

interface IBoxArea {
    width: number;
    height: number;
    x: number;
    y: number;
}

export function computedBoxArea(options: IInputOptins): IBoxArea {
    const { input, render } = options;
    const boxArea: IBoxArea = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    };
    // 视频高度适配 OR 宽度适配
    if (render.height > render.width) {
        boxArea.height = render.height;
        boxArea.width = Math.round(
            (boxArea.height / input.height) * input.width
        );
        boxArea.x = Math.round((render.width - boxArea.width) / 2);
        boxArea.y = 0;
    } else {
        boxArea.width = render.width;
        boxArea.height = Math.round(
            (boxArea.width / input.width) * input.height
        );
        boxArea.x = 0;
        boxArea.y = Math.round((render.height - boxArea.height) / 2);
    }
    return boxArea;
}

interface IGif2VideoOptions {
    path: string;
    width: number;
    height: number;
    fileName: string;
    inputFileType: string;
    outputFileType: string;
}

interface IConvertResutl {
    originPath: string;
    outputPath: string;
    meta: IBoxArea;
}

export async function convertGif2Video(
    options: IGif2VideoOptions
): Promise<IConvertResutl> {
    const { path, width, height, fileName, inputFileType, outputFileType } =
        options;
    const meta = await getImageMeta(path);
    const boxArea = computedBoxArea({
        input: {
            width: meta.width!,
            height: meta.height!,
        },
        render: {
            width,
            height,
        },
    });
    return new Promise((resolve, reject) => {
        const outputPath = path.replace(inputFileType, outputFileType);
        const size = `${boxArea.width}x${boxArea.height}`;
        ffmpeg(path)
            .format(outputFileType)
            .size(size)
            .on('start', function (commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('codecData', function (data) {
                console.log(
                    'Input is ' +
                        data.audio +
                        ' audio ' +
                        'with ' +
                        data.video +
                        ' video'
                );
            })
            .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done');
            })
            .on('stderr', function (stderrLine) {
                console.log('Stderr output: ' + stderrLine);
            })
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
                reject(err);
            })
            .on('end', function () {
                console.log('Processing finished !');
                resolve({
                    originPath: path,
                    outputPath,
                    meta: boxArea,
                });
            })
            .save(outputPath);
    });
}
