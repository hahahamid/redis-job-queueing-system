const sharp = require('sharp');

/**
 * Resizes an image using Sharp and saves it to the output path
 * @param {string} inputPath - Path to the input image
 * @param {string} outputPath - Path where the resized image will be saved
 * @param {Object} size - Size object with width and height
 */
async function resizeImage(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height)
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to resize image: ${error.message}`);
  }
}

module.exports = { resizeImage };