const Crawler = require('crawler');
const download = require('download');
const axios = require('axios');

const fetchComments = () => {
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
                        const imageLink = current.find(
                            '.text .view_img_link'
                        )[0];
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

const loadCommnet = (id) => {
    return axios
        .get(`http://jandan.net/api/tucao/list/${id}`)
        .then(({ data }) => data.hot_tucao);
};

const downloadComments = (comments) => {
    const tasks = comments.map((comment, index) => {
        const { url, id } = comment;
        console.log('download', url);
        const filename = `${index}${url.match(/\.\w+$/)[0]}`;
        const output = `download/${new Date()
            .toLocaleDateString()
            .replace(/\//g, '')}`;
        return Promise.all([
            download(url, output, { filename }).then(
                () => `${output}/${filename}`
            ),
            loadCommnet(id),
        ]).then(([path, data]) => {
            console.log(path, data);
            return { path, data };
        });
    });
    return Promise.all(tasks);
};

const convertImages = (files) => {};

module.exports = {
    fetchComments,
    downloadComments,
};
