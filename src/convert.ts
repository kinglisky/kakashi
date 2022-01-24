import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { IFileInfo, IDonwloadItem } from './resources';

interface IRenderOptins {
    input: {
        width: number;
        height: number;
    };
    container: {
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

function computedVideoRenderArea(options: IRenderOptins): IBoxArea {
    const { input, container } = options;
    const boxArea: IBoxArea = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    };
    const containerRatioHW = container.height / container.width;
    const inputRatioHW = input.height / input.width;
    if (containerRatioHW > inputRatioHW) {
        boxArea.width = container.width;
        boxArea.height = Math.round(
            (container.width / input.width) * input.height
        );
    } else {
        boxArea.height = container.height;
        boxArea.width = Math.round(
            (container.height / input.height) * input.width
        );
    }

    boxArea.x = Math.round((container.width - boxArea.width) / 2);
    boxArea.y = Math.round((container.height - boxArea.height) / 2);
    return boxArea;
}

function getImageMeta(filePath: string): Promise<sharp.Metadata> {
    return sharp(filePath).metadata();
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
    const { path, width, height, inputFileType, outputFileType } = options;
    const meta = await getImageMeta(path);
    const boxArea = computedVideoRenderArea({
        input: {
            width: meta.width!,
            height: meta.height!,
        },
        container: {
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

interface IViewContainer {
    width: number;
    height: number;
}

type IConvertResult = IFileInfo & {
    output: {
        path: string;
        width: number;
        height: number;
    };
};

async function resizeImage(file: IFileInfo, viewContainer: IViewContainer) {
    const meta = await getImageMeta(file.path);
}

export async function convertImage(
    file: IFileInfo,
    viewContainer: IViewContainer
): Promise<void> {}

export async function convertImages(
    downloadList: Array<IDonwloadItem>,
    viewContainer: IViewContainer
) {
    return downloadList.reduce((promise, downloadItem) => {
        return promise.then(() => {
            const { files } = downloadItem;
            const convertTasks = files.map((file) =>
                convertImage(file, viewContainer)
            );
            return Promise.all(convertTasks).then(() => {});
        });
    }, Promise.resolve());
}