// colorNames.ts

export type RGB = { r: number; g: number; b: number };

export interface ColorNameResult {
  name: string;
  distance: number;
  hex?: string;
}

export const hexToRgb = (hex: string): RGB | null => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
      }
    : null;
};

/**
 * Get the closest color name using the color-name-api
 * @param hex - The hex color code (with or without #)
 * @returns Promise with the color name result
 */
export const getClosestColorName = async (hex: string): Promise<ColorNameResult> => {
  try {
    // Normalize hex (remove # if present)
    const normalizedHex = hex.replace('#', '');
    
    // Call the color-name-api
    const response = await fetch(`https://api.color.pizza/v1/${normalizedHex}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API returns an array of colors, we want the first (closest) match
    if (data.colors && data.colors.length > 0) {
      const closestColor = data.colors[0];
      return {
        name: closestColor.name,
        distance: closestColor.distance || 0,
        hex: `#${closestColor.hex}`,
      };
    }
    
    return { name: 'Unknown', distance: 0, hex };
  } catch (error) {
    console.error('Error fetching color name:', error);
    return { name: 'Unknown', distance: 0, hex };
  }
};

/**
 * Get color names for multiple hex codes in batch
 * @param hexColors - Array of hex color codes
 * @returns Promise with array of color name results
 */
export const getMultipleColorNames = async (hexColors: string[]): Promise<ColorNameResult[]> => {
  const promises = hexColors.map(hex => getClosestColorName(hex));
  return Promise.all(promises);
};