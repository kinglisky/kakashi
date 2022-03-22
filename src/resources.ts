import Crawler from 'crawler';
import download from 'download';
import axios from 'axios';
import { writeFile, exists } from './utils';
export interface IComment {
    id: string;
    urls: Array<string>;
}

export interface IFileInfo {
    path: string;
    url: string;
    fileName: string;
    fileType: string;
}
export interface IResourcesItem {
    data: any;
    files: Array<IFileInfo>;
}

export function fetchComments(): Promise<Array<IComment>> {
    return new Promise((resolve, reject) => {
        const c = new Crawler({});
        c.queue([
            {
                jQuery: true,
                uri: 'http://jandan.net/top',
                callback: (error, res, done) => {
                    if (error) {
                        done();
                        return reject(error);
                    }
                    done();
                    const { $ } = res;
                    const items: Array<IComment> = [];
                    $('#comments ol li .row').each((_, it) => {
                        const current = $(it);
                        const urls: Array<string> = [];
                        current.find('.text .view_img_link').each((_, imageLink) => {
                            const imageURL = `http:${
                                (imageLink as cheerio.TagElement).attribs.href
                            }`;
                            urls.push(imageURL);
                        });
                        const tucaoLink = current.find('.tucao-btn')[0] as cheerio.TagElement;
                        items.push({
                            urls,
                            id: tucaoLink.attribs['data-id'],
                        });
                    });
                    resolve(items);
                },
            },
        ]);
    });
}

export function loadComment(id: string): Promise<any> {
    return axios.get(`http://jandan.net/api/tucao/list/${id}`).then(({ data }) => data.hot_tucao);
}

export function downloadImages(
    urls: Array<string>,
    id: string,
    outputDir: string = 'download'
): Promise<IResourcesItem['files']> {
    const tasks = urls.map(async (url, index) => {
        console.log(`download: ${url}`);
        // 配置 .xxx 后缀
        const matchFile = url.match(/\.(\w+)$/);
        const fileName = `${id}-${index}${matchFile![0]}`;
        const fileType = matchFile![1].toLowerCase();
        const outputPath = `${outputDir}/${fileName}`;
        const res = {
            url,
            fileName,
            fileType,
            path: outputPath,
        };
        const exist = await exists(outputPath);
        if (exist) {
            console.log(`download: ${url} existed`);
            return res;
        }
        await download(url, outputDir, { filename: fileName });
        console.log(`download: ${url} completed`);
        return res;
    });
    return Promise.all(tasks);
}

export async function downloadResources(comments: Array<IComment>): Promise<Array<IResourcesItem>> {
    const tasks = comments.map((item) => {
        const { urls, id } = item;
        return Promise.all([downloadImages(urls, id), loadComment(id)]).then(([files, data]) => ({
            files,
            data,
        }));
    });
    const res = await Promise.all(tasks);
    await writeFile('resources.json', JSON.stringify(res, null, 4));
    return res;
}

export async function checkResources(
    resources: IResourcesItem[],
    options: { sourceDir: string; targetDir: string }
): Promise<IResourcesItem[]> {
    const filtedResources: IResourcesItem[] = [];
    await resources.reduce(async (promise, item) => {
        await promise;
        const { files } = item;
        const { sourceDir, targetDir } = options;
        const tasks = files.map((file) => {
            const targetPath = file.path.replace(sourceDir, targetDir);
            console.log(`check: ${targetPath}`);
            return exists(targetPath).then((existed) => {
                if (existed) {
                    file.path = targetPath;
                }
                return existed;
            });
        });
        const res = await Promise.all(tasks);
        if (res.every((it) => it)) {
            filtedResources.push(item);
        }
    }, Promise.resolve());
    return filtedResources;
}
