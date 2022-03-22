import { fetchComments, downloadResources } from './src/resources';

(async function () {
    const comments = await fetchComments();
    const sourceItems = await downloadResources(comments);
    console.log(sourceItems.length);
})();
