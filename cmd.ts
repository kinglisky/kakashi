import ffmpeg from 'fluent-ffmpeg';

(async function () {
    ffmpeg.ffprobe('./output.mp4', function (err, metadata) {
        console.dir(metadata);
    });
})();
