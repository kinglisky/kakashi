const fs = require('fs');
const uitl = require('util');
const { fetchComments, downloadComments } = require('./resources');
const writeFile = uitl.promisify(fs.writeFile);

(async function () {
    const comments = await fetchComments();
    const res = await downloadComments(Array.from(comments));
    await writeFile('./res.json', JSON.stringify(res, null, 4));
    console.log(res);
})();
