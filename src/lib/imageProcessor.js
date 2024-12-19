// src/lib/imageProcessor.js
import { kMeans } from './colorUtils';

export async function processImage(imageFile, dimensions, numColors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { pixels, colorPalette } = reduceColors(imageData, numColors);
        const pattern = createPattern(pixels, dimensions);

        resolve({
          pattern,
          colorPalette,
          dimensions,
        });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

function reduceColors(imageData, numColors) {
  const pixels = [];
  const colors = new Set();

  // Collect unique colors
  for (let i = 0; i < imageData.data.length; i += 4) {
    const color = {
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2]
    };
    colors.add(`${color.r},${color.g},${color.b}`);
    pixels.push(color);
  }

  // Convert to array of RGB objects
  const uniqueColors = Array.from(colors).map(color => {
    const [r, g, b] = color.split(',').map(Number);
    return { r, g, b };
  });

  // Perform k-means clustering
  const { centroids, assignments } = kMeans(uniqueColors, numColors);
  
  // Map original pixels to their nearest centroid
  const reducedPixels = pixels.map(pixel => {
    const nearest = findNearestCentroid(pixel, centroids);
    return centroids.indexOf(nearest) + 1; // 1-based index for pattern
  });

  return {
    pixels: reducedPixels,
    colorPalette: centroids.map(rgbToHex)
  };
}

function createPattern(pixels, dimensions) {
  const pattern = [];
  for (let y = 0; y < dimensions.height; y++) {
    const row = [];
    for (let x = 0; x < dimensions.width; x++) {
      row.push(pixels[y * dimensions.width + x]);
    }
    pattern.push(row);
  }
  return pattern;
}

function findNearestCentroid(color, centroids) {
  let minDistance = Infinity;
  let nearest = centroids[0];

  centroids.forEach(centroid => {
    const distance = colorDistance(color, centroid);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = centroid;
    }
  });

  return nearest;
}

function colorDistance(c1, c2) {
  // Using weighted RGB distance for better perceptual accuracy
  const rMean = (c1.r + c2.r) / 2;
  const r = c1.r - c2.r;
  const g = c1.g - c2.g;
  const b = c1.b - c2.b;
  
  return Math.sqrt(
    (2 + rMean/256) * r * r +
    4 * g * g +
    (2 + (255-rMean)/256) * b * b
  );
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}