import { fetchComments, downloadComments, IFileInfo } from './resources';
import { convertGif2Video } from './convert';

(async function () {
    const comments = await fetchComments();
    const items = await downloadComments(comments);
    const files: Array<IFileInfo> = [];
    items.forEach((item) => {
        files.push(...item.files.filter((file) => file.fileType === 'gif'));
    });
    const res: any[] = [];
    files.reduce((promise, file) => {
        return promise
            .then(() => {
                return convertGif2Video({
                    fileName: file.fileName,
                    path: file.path,
                    width: 1920,
                    height: 1080,
                    inputFileType: 'gif',
                    outputFileType: 'mp4',
                }).then(() => {});
            })
            .catch(() => {});
    }, Promise.resolve());
    console.log('done', res);
})();
