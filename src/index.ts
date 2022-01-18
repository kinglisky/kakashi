import { getImageMeta } from './convert';

(async function name() {
    const testFilePath = './download/2022118/001Hf62Dly1gyft1n5wc1g60a00a0u1902.gif';
    const res = await getImageMeta(testFilePath);
    console.log('xx', res);
})();
