import util from 'util';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import { exists } from './utils';
import { IViewContainer, IRenderSize } from './convert';

const run = util.promisify(exec);

interface ImageToVideoOptions {
    input: string;
    output: string;
    format: string;
    size: string;
}

export function getVideoMetadata(input: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, function (err, metadata) {
            if (err) {
                reject(err);
            }
            resolve(metadata);
        });
    });
}

export function getVideoDuration(input: string): Promise<number> {
    return getVideoMetadata(input).then((metadata) => {
        console.log(metadata);
        return Math.ceil(metadata.format.duration!);
    });
}

export async function gif2Video(options: ImageToVideoOptions): Promise<number> {
    const convert = () => {
        return new Promise((resolve) => {
            ffmpeg(options.input)
                .format(options.format)
                .size(options.size)
                .on('start', function (commandLine) {
                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                    throw new Error(err.message);
                })
                .on('end', function () {
                    console.log('Processing finished !');
                    resolve(null);
                })
                .save(options.output);
        });
    };
    if (!(await exists(options.output))) {
        await convert();
    } else {
        console.log(`${options.output} exists skip~`);
    }
    return getVideoDuration(options.output);
}

interface ScrollImageToVideoOptions {
    input: string;
    output: string;
    imageSzie: IRenderSize;
    container: IViewContainer;
}

export async function scrollImage2Video(options: ScrollImageToVideoOptions): Promise<number> {
    console.log('scrollImage2Video', options);
    const { input, output, imageSzie, container } = options;
    if (!(await exists(output))) {
        const dh = imageSzie.height - container.height;
        const minDuration = 6;
        const maxSpeed = Math.floor(dh / minDuration);
        const speed = Math.min(60, maxSpeed);
        const duration = Math.ceil((imageSzie.height - container.height) / speed);
        const size = `${imageSzie.width}x${container.height}`;
        const cmd = `ffmpeg -loop 1 -t ${duration} -i ${input} -filter_complex "color=white:s=${size},fps=fps=60[bg];[bg][0]overlay=y=-'t\*${speed}':shortest=1[video]" -r 200/1 -preset ultrafast -map [video] -y ${output}`;
        console.log(`run scrollImage2Video: ${cmd}`);
        await run(cmd);
        return duration;
    }
    console.log(`${options.output} exists skip~`);
    return getVideoDuration(output);
}

interface StaticImageToVideoOptions {
    input: string;
    output: string;
    duration: number;
}

export async function staticImage2Video(options: StaticImageToVideoOptions): Promise<number> {
    console.log(`run staticImage2Video:`, options);
    const { input, output, duration } = options;
    if (!(await exists(output))) {
        const cmd = `ffmpeg -r 1 -loop 1 -i ${input}  -t ${duration}  -y ${output}`;
        await run(cmd);
    } else {
        console.log(`${options.output} exists skip~`);
    }

    return duration;
}
