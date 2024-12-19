// src/lib/colorUtils.js
export function kMeans(colors, k, maxIterations = 10) {
    // Initialize centroids randomly from input colors
    let centroids = colors
      .sort(() => 0.5 - Math.random())
      .slice(0, k)
      .map(color => ({ ...color }));
  
    let assignments = new Array(colors.length);
    let hasConverged = false;
    let iteration = 0;
  
    while (!hasConverged && iteration < maxIterations) {
      // Assign points to nearest centroid
      const newAssignments = colors.map((color, i) => {
        let minDist = Infinity;
        let centroidIndex = 0;
  
        centroids.forEach((centroid, j) => {
          const dist = colorDistance(color, centroid);
          if (dist < minDist) {
            minDist = dist;
            centroidIndex = j;
          }
        });
  
        return centroidIndex;
      });
  
      // Check for convergence
      hasConverged = assignments.every((a, i) => a === newAssignments[i]);
      assignments = newAssignments;
  
      // Update centroids
      centroids = centroids.map((_, i) => {
        const assignedColors = colors.filter((_, j) => assignments[j] === i);
        if (assignedColors.length === 0) return centroids[i];
  
        return {
          r: Math.round(assignedColors.reduce((sum, c) => sum + c.r, 0) / assignedColors.length),
          g: Math.round(assignedColors.reduce((sum, c) => sum + c.g, 0) / assignedColors.length),
          b: Math.round(assignedColors.reduce((sum, c) => sum + c.b, 0) / assignedColors.length)
        };
      });
  
      iteration++;
    }
  
    return { centroids, assignments };
  }
  
  export function colorDistance(c1, c2) {
    // Using CIE76 color difference formula
    const l1 = 0.2126 * c1.r + 0.7152 * c1.g + 0.0722 * c1.b;
    const l2 = 0.2126 * c2.r + 0.7152 * c2.g + 0.0722 * c2.b;
    
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    
    return Math.sqrt(
      2 * dr * dr +
      4 * dg * dg +
      3 * db * db +
      (l1 - l2) * (l1 - l2) / 2
    );
  }
  
  export function getColorName(rgb) {
    // Basic color naming based on RGB values
    const { r, g, b } = rgb;
    const total = r + g + b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
  
    if (total < 150) return 'dark';
    if (total > 650) return 'light';
  
    if (diff < 30) {
      if (total < 300) return 'gray';
      return 'white';
    }
  
    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    
    if (r > b && g > b) return 'yellow';
    if (r > g && b > g) return 'purple';
    if (g > r && b > r) return 'cyan';
  
    return 'neutral';
  }

  // Add explicit export for hexToRgb function
export function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
  
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    return { r, g, b };
  }
  
  export const SUGGESTED_YARNS = {
    red: [
      { name: "Red Heart Super Saver", color: "#E41B17", weight: "4", fiber: "Acrylic" },
      { name: "Lion Brand Vanna's Choice", color: "#C11B17", weight: "4", fiber: "Acrylic" }
    ],
    blue: [
      { name: "Bernat Super Value", color: "#0000FF", weight: "4", fiber: "Acrylic" },
      { name: "Caron Simply Soft", color: "#1589FF", weight: "4", fiber: "Acrylic" }
    ],
    green: [
      { name: "Lion Brand Basic Stitch", color: "#228B22", weight: "4", fiber: "Acrylic" },
      { name: "Red Heart With Love", color: "#006400", weight: "4", fiber: "Acrylic" }
    ],
    yellow: [
      { name: "Lily Sugar'n Cream", color: "#FFD700", weight: "4", fiber: "Cotton" },
      { name: "Paintbox Yarns Cotton", color: "#FFA500", weight: "4", fiber: "Cotton" }
    ],
    purple: [
      { name: "Loops & Threads Impeccable", color: "#800080", weight: "4", fiber: "Acrylic" },
      { name: "Bernat Maker", color: "#4B0082", weight: "4", fiber: "Cotton/Nylon" }
    ],
    gray: [
      { name: "Lion Brand Wool-Ease", color: "#808080", weight: "4", fiber: "Wool/Acrylic" },
      { name: "Patons Classic", color: "#696969", weight: "4", fiber: "Wool" }
    ],
    white: [
      { name: "Cascade 220", color: "#FFFFFF", weight: "4", fiber: "Wool" },
      { name: "Plymouth Encore", color: "#F5F5F5", weight: "4", fiber: "Wool/Acrylic" }
    ],
    dark: [
      { name: "Lion Brand Fishermen's Wool", color: "#1A1A1A", weight: "4", fiber: "Wool" },
      { name: "Berroco Ultra Wool", color: "#2F2F2F", weight: "4", fiber: "Wool" }
    ]
  };