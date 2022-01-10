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
        const filename = `${index}${image.match(/\.\w+$/)[0]}`
        return download(image, 'download', { filename });
    });
    return Promise.all(tasks);
}

(async function () {
    const images = await fetchImages();
    await downloadImages(images);
})();
