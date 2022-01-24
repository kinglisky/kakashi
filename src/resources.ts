import Crawler from 'crawler';
import download from 'download';
import axios from 'axios';
import * as fs from 'fs';
import * as util from 'util';

const writeFile = util.promisify(fs.writeFile);
interface IComment {
    id: string;
    urls: Array<string>;
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
                        current
                            .find('.text .view_img_link')
                            .each((_, imageLink) => {
                                const imageURL = `http:${
                                    (imageLink as cheerio.TagElement).attribs
                                        .href
                                }`;
                                urls.push(imageURL);
                            });
                        const tucaoLink = current.find(
                            '.tucao-btn'
                        )[0] as cheerio.TagElement;
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
    return axios
        .get(`http://jandan.net/api/tucao/list/${id}`)
        .then(({ data }) => data.hot_tucao);
}

export interface IFileInfo {
    path: string;
    url: string;
    fileName: string;
    fileType: string;
}
export interface IDonwloadItem {
    data: any;
    files: Array<IFileInfo>;
}

export function downloadCommentImages(
    urls: Array<string>,
    dir: string,
    id: string
): Promise<IDonwloadItem['files']> {
    const tasks = urls.map((url, index) => {
        console.log(`download: ${url}`);
        // 配置 .xxx 后缀
        const matchFile = url.match(/\.(\w+)$/);
        const fileName = `${id}-${index}${matchFile![0]}`;
        const fileType = matchFile![1].toLowerCase();
        const output = `download/${dir}`;
        return download(url, output, { filename: fileName }).then(() => {
            console.log(`download: ${url} completed`);
            return {
                url,
                fileName,
                fileType,
                path: `${output}/${fileName}`,
            };
        });
    });
    return Promise.all(tasks);
}

export async function downloadComments(
    comments: Array<IComment>
): Promise<Array<IDonwloadItem>> {
    const date = new Date().toLocaleDateString().replace(/\//g, '');
    const tasks = comments.map((item) => {
        const { urls, id } = item;
        return Promise.all([
            downloadCommentImages(urls, date, id),
            loadComment(id),
        ]).then(([files, data]) => ({ files, data }));
    });
    const res = await Promise.all(tasks);
    await writeFile('comments.josn', JSON.stringify(res, null, 4));
    return res;
}
