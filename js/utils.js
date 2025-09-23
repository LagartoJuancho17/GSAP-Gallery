/**
 * Preloads images specified by the CSS selector.
 * @function
 * @param {string} [selector='img'] - CSS selector for target images.
 * @returns {Promise} - Resolves when all specified images are loaded.
 */
const preloadImages = (selector = 'img', onProgress) => {
  return new Promise((resolve) => {
    const images = document.querySelectorAll(selector);
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      resolve();
      return;
    }

    const checkAllLoaded = () => {
      loadedCount++;
      if (typeof onProgress === 'function' && totalImages > 0) {
        onProgress(loadedCount / totalImages);
      }
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
      }
    });
  });
};

// Exporting utility functions for use in other modules.
export {
  preloadImages
};
