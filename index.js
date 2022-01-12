const { fetchImages, downloadImages } = require('./resources');

(async function () {
    const images = await fetchImages();
    const paths = await downloadImages(images);
    console.log(paths);
})();