import sharp from "sharp";

async function processImage(buffer) {
  const originalImageBuffer = sharp(buffer);
  const optimizedOriginalBuffer = await originalImageBuffer
    .clone()
    .resize({ width: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const thumbnailBuffer = await originalImageBuffer
    .clone()
    .resize({ width: 200, height: 200, fit: "cover" })
    .webp({ quality: 75 })
    .toBuffer();

  return [optimizedOriginalBuffer, thumbnailBuffer];
}

export default processImage;
