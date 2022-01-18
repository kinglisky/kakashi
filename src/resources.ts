import Crawler from 'crawler';
import download from 'download';
import axios from 'axios';

export const fetchComments = () => {
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
                    const items = $('#comments ol li .row').map((_, it) => {
                        const current = $(it);
                        const imageLink = current.find('.text .view_img_link')[0];
                        const tucaoLink = current.find('.tucao-btn')[0];
                        return {
                            url: `http:${imageLink.attribs.href}`,
                            id: tucaoLink.attribs['data-id'],
                        };
                    });
                    resolve(items);
                },
            },
        ]);
    });
};

export const loadCommnet = (id) => {
    return axios.get(`http://jandan.net/api/tucao/list/${id}`).then(({ data }) => data.hot_tucao);
};

export const downloadComments = (comments) => {
    const res = [];
    // 可以用 map 但 reduce 可以看到单个文件下载的进度，比较爽~
    return comments
        .reduce((promise, item, index) => {
            const { url, id } = item;
            console.log(`download: ${url}`);
            const matchFile = url.match(/\w+\.(\w+)$/);
            const fileName = matchFile[0];
            const fileType = matchFile[1].toLowerCase();
            const output = `download/${new Date().toLocaleDateString().replace(/\//g, '')}`;
            return promise.then(() => {
                return Promise.all([
                    download(url, output, { filename: fileName }).then(
                        () => `${output}/${fileName}`
                    ),
                    loadCommnet(id),
                ]).then(([path, data]) => {
                    res.push({ path, data, url, fileName, fileType });
                });
            });
        }, Promise.resolve())
        .then(() => res);
};
