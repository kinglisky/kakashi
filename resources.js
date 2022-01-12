const Crawler = require('crawler');
const download = require('download');

const fetchImages = () => {
    return new Promise((resolve, reject) => {
        const c = new Crawler({});
        c.queue([{
            jQuery: true,
            uri: 'http://jandan.net/top',
            callback: (error, res, done) => {
                if (error) {
                    done();
                    return reject(error);
                }
                done();
                const images = res
                    .$('#comments ol li .text .view_img_link')
                    .map((_, it) => `https:${it.attribs.href}`)
                    .get();
                resolve(images);
            }
        }]);
    });
}

const downloadImages = (images) => {
    const tasks = images.map((image, index) => {
        console.log('download', image);
        const filename = `${index}${image.match(/\.\w+$/)[0]}`;
        const output = `download/${new Date().toLocaleDateString().replace(/\//g, '')}`;
        return download(image, output, { filename }).then(() => `${output}/${filename}`);
    });
    return Promise.all(tasks);
}

const convertImages = (files) => {

}

module.exports = {
    fetchImages,
    downloadImages,
}