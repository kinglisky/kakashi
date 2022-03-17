import path from 'path';
import util from 'util';
import { exec } from 'child_process';

(async function () {
    // const inputPath = path.join(__dirname, './input.jpg');
    const run = util.promisify(exec);
    const cmd = `ffmpeg -loop 1 -t 25 -i input.jpg -filter_complex "color=white:s=750x1080,fps=fps=60[bg];[bg][0]overlay=y=-'t\*120':shortest=1[video]" -r 200/1 -preset ultrafast -map [video] -y "output.mp4"`;
    const { stdout, stderr } = await run(cmd);
    console.log(stdout);
    console.log(stderr);
})();
