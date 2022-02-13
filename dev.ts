import {
    fetchComments,
    downloadComments,
    IFileInfo,
    IDonwloadItem,
} from './src/resources';
import { convertImages } from './src/convert';

(async function () {
    const comments = await fetchComments();
    const items = await downloadComments(comments);
    const res: any[] = await convertImages(items, {
        width: 1920,
        height: 1080,
    });
    console.log('done', res);
})();
