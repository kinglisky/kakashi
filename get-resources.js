const Crawler = require('crawler');

const c = new Crawler({});

// Queue URLs with custom callbacks & parameters
c.queue([{
    jQuery: true,
    uri: 'http://jandan.net/top',
    // The global callback won't be called
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const images = res.$('#comments ol li .text img').map((index, it) => it.attribs.src).get();
            console.log(images);
        }
        done();
    }
}]);
