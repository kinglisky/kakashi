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

interface IRenderArea {
    width: number;
    height: number;
    x: number;
    y: number;
}

interface IViewContainer {
    width: number;
    height: number;
}

interface IConvertResutl {
    file: IFileInfo;
    output: string;
    renderArea: IRenderArea;
}


function computedVideoRenderArea(options: IRenderOptins): IRenderArea {
    const { input, container } = options;
    const renderArea: IRenderArea = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    };
    const containerRatioHW = container.height / container.width;
    const inputRatioHW = input.height / input.width;
    if (containerRatioHW > inputRatioHW) {
        renderArea.width = container.width;
        renderArea.height = Math.round(
            (container.width / input.width) * input.height
        );
    } else {
        renderArea.height = container.height;
        renderArea.width = Math.round(
            (container.height / input.height) * input.width
        );
    }

    renderArea.x = Math.round((container.width - renderArea.width) / 2);
    renderArea.y = Math.round((container.height - renderArea.height) / 2);
    return renderArea;
}

function getImageMeta(filePath: string): Promise<sharp.Metadata> {
    return sharp(filePath).metadata();
}

async function convertGif2Video(file: IFileInfo, viewContainer: IViewContainer, videoType: string = 'mp4'): Promise<IConvertResutl> {
    const { path, fileType } = file;
    const meta = await getImageMeta(path);
    const renderArea = computedVideoRenderArea({
        input: {
            width: meta.width!,
            height: meta.height!,
        },
        container: {
            width: viewContainer.width,
            height: viewContainer.height,
        },
    });
    return new Promise((resolve, reject) => {
        const outputPath = path.replace(fileType, videoType);
        const size = `${renderArea.width}x${renderArea.height}`;
        ffmpeg(path)
            .format(videoType)
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
                    file,
                    renderArea,
                    output: outputPath,
                });
            })
            .save(outputPath);
    });
}

async function convertImage2Video(file: IFileInfo, viewContainer: IViewContainer): Promise<IConvertResutl> {
    return {
        file,
        output: '',
        renderArea: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    }

}

const convertHandlers = new Map<string, (...args: any[]) => Promise<IConvertResutl>>([
    ['gif', convertGif2Video],
    ['default', convertImage2Video]
]);

export async function convertImage(
    file: IFileInfo,
    viewContainer: IViewContainer
): Promise<IConvertResutl> {
    const handler = convertHandlers.get(file.fileType) || convertHandlers.get('default');
    return handler!(file, viewContainer);
}

export async function convertImages(
    downloadList: Array<IDonwloadItem>,
    viewContainer: IViewContainer
): Promise<Array<IConvertResutl>> {
    const res: Array<IConvertResutl> = [];
    await downloadList.reduce((promise: Promise<any>, downloadItem) => {
        return promise.then(() => {
            const { files } = downloadItem;
            const convertTasks = files.map((file) => {
                console.log(`convert: ${file.path}`);
                return convertImage(file, viewContainer);
            });
            return Promise.all(convertTasks).then((data) => res.push(...data));
        });
    }, Promise.resolve());
    return res;
}
