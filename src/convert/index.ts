import sharp from 'sharp';

export const getImageMeta = (filePath: string) => {
    return sharp(filePath).metadata();
};
