import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { exists } from './utils';
import { IFileInfo, IDonwloadItem } from './resources';

export interface IRenderOptins {
    input: {
        width: number;
        height: number;
    };
    container: {
        width: number;
        height: number;
    };
}

export interface IRenderArea {
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface IViewContainer {
    width: number;
    height: number;
}

export interface IConvertResutl {
    file: IFileInfo;
    output: string;
    renderArea: IRenderArea;
    type: 'image' | 'video';
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

async function convertGif2Video(
    file: IFileInfo,
    viewContainer: IViewContainer,
    videoType: string = 'mp4'
): Promise<IConvertResutl> {
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
    const outputPath = path.replace(fileType, videoType);
    const size = `${renderArea.width}x${renderArea.height}`;
    const result: IConvertResutl = {
        file,
        renderArea,
        output: outputPath,
        type: 'video',
    };
    if (await exists(outputPath)) {
        console.log(`${outputPath} exists skip~`);
        return result;
    }
    return new Promise((resolve, reject) => {
        ffmpeg(path)
            .format(videoType)
            .size(size)
            .on('start', function (commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
                reject(err);
            })
            .on('end', function () {
                console.log('Processing finished !');
                resolve(result);
            })
            .save(outputPath);
    });
}

interface RenderSize {
    width: number;
    height: number;
}

function computedImageRenderSize(options: IRenderOptins): RenderSize {
    const { input, container } = options;
    // 图片最小渲染宽度
    const imageSafeWidth = 750;
    const renderSize = {
        width: 0,
        height: 0,
    };
    const containerRatioHW = container.height / container.width;
    const inputRatioHW = input.height / input.width;
    if (containerRatioHW > inputRatioHW) {
        renderSize.width = container.width;
        renderSize.height = Math.round(
            (container.width / input.width) * input.height
        );
    } else {
        renderSize.height = container.height;
        renderSize.width = Math.round(
            (container.height / input.height) * input.width
        );
    }

    if (renderSize.width < imageSafeWidth) {
        renderSize.width = imageSafeWidth;
        renderSize.height = Math.round(
            (imageSafeWidth / input.width) * input.height
        );
    }

    return renderSize;
}
async function resizeImage(file: IFileInfo, size: RenderSize): Promise<string> {
    const { path, fileType } = file;
    const outputPath = path.replace(fileType, `resize.${fileType}`);
    if (await exists(outputPath)) {
        console.log(`${outputPath} exists skip~`);
        return outputPath;
    }
    return new Promise((resolve, reject) => {
        sharp(path)
            .resize(size.width, size.height)
            .toFile(outputPath, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(outputPath);
                }
            });
    });
}

async function convertImage2Video(
    file: IFileInfo,
    viewContainer: IViewContainer
): Promise<IConvertResutl> {
    const meta = await getImageMeta(file.path);
    const renderSize = computedImageRenderSize({
        input: {
            width: meta.width!,
            height: meta.height!,
        },
        container: viewContainer,
    });
    const output = await resizeImage(file, renderSize);
    return {
        file,
        output,
        renderArea: {
            x: (viewContainer.width - renderSize.width) / 2,
            y: Math.max(0, (viewContainer.height - renderSize.height) / 2),
            width: renderSize.width,
            height: renderSize.height,
        },
        type: 'image',
    };
}

const convertHandlers = new Map<
    string,
    (...args: any[]) => Promise<IConvertResutl>
>([
    ['gif', convertGif2Video],
    ['default', convertImage2Video],
]);

export async function convertImage(
    file: IFileInfo,
    viewContainer: IViewContainer
): Promise<IConvertResutl> {
    const handler =
        convertHandlers.get(file.fileType) || convertHandlers.get('default');
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
