// colorNames.ts

export type RGB = { r: number; g: number; b: number };

export const colorNames: { [key: string]: string } = {
  '#000000': 'Black', '#FFFFFF': 'White', '#FF0000': 'Red', '#00FF00': 'Lime',
  '#0000FF': 'Blue', '#FFFF00': 'Yellow', '#00FFFF': 'Cyan', '#FF00FF': 'Magenta',
  '#C0C0C0': 'Silver', '#808080': 'Gray', '#800000': 'Maroon', '#808000': 'Olive',
  '#008000': 'Green', '#800080': 'Purple', '#008080': 'Teal', '#000080': 'Navy',
  '#FFA500': 'Orange', '#FFC0CB': 'Pink', '#A52A2A': 'Brown', '#F0E68C': 'Khaki',
  '#E6E6FA': 'Lavender', '#FFE4E1': 'Misty Rose', '#F5DEB3': 'Wheat', '#D2691E': 'Chocolate',
  '#FF6347': 'Tomato', '#FF69B4': 'Hot Pink', '#CD5C5C': 'Indian Red', '#F08080': 'Light Coral',
  '#FA8072': 'Salmon', '#E9967A': 'Dark Salmon', '#FFA07A': 'Light Salmon', '#DC143C': 'Crimson',
  '#B22222': 'Firebrick', '#8B0000': 'Dark Red', '#FFB6C1': 'Light Pink', '#FF1493': 'Deep Pink',
  '#C71585': 'Medium Violet Red', '#DB7093': 'Pale Violet Red', '#FFF0F5': 'Lavender Blush',
  '#FF7F50': 'Coral', '#FF4500': 'Orange Red', '#FFD700': 'Gold', '#FFFFE0': 'Light Yellow',
  '#FFFACD': 'Lemon Chiffon', '#FAFAD2': 'Light Goldenrod Yellow', '#FFEFD5': 'Papaya Whip',
  '#FFE4B5': 'Moccasin', '#FFDAB9': 'Peach Puff', '#EEE8AA': 'Pale Goldenrod', '#BDB76B': 'Dark Khaki',
  '#90EE90': 'Light Green', '#98FB98': 'Pale Green', '#8FBC8F': 'Dark Sea Green',
  '#00FA9A': 'Medium Spring Green', '#00FF7F': 'Spring Green', '#3CB371': 'Medium Sea Green',
  '#2E8B57': 'Sea Green', '#228B22': 'Forest Green', '#006400': 'Dark Green', '#9ACD32': 'Yellow Green',
  '#32CD32': 'Lime Green', '#7FFF00': 'Chartreuse', '#7CFC00': 'Lawn Green', '#ADFF2F': 'Green Yellow',
  '#40E0D0': 'Turquoise', '#48D1CC': 'Medium Turquoise', '#AFEEEE': 'Pale Turquoise',
  '#B0E0E6': 'Powder Blue', '#ADD8E6': 'Light Blue', '#87CEEB': 'Sky Blue', '#87CEFA': 'Light Sky Blue',
  '#00BFFF': 'Deep Sky Blue', '#1E90FF': 'Dodger Blue', '#6495ED': 'Cornflower Blue',
  '#4169E1': 'Royal Blue', '#0000CD': 'Medium Blue', '#00008B': 'Dark Blue', '#191970': 'Midnight Blue',
  '#7B68EE': 'Medium Slate Blue', '#6A5ACD': 'Slate Blue', '#483D8B': 'Dark Slate Blue',
  '#D8BFD8': 'Thistle', '#DDA0DD': 'Plum', '#EE82EE': 'Violet', '#DA70D6': 'Orchid',
  '#BA55D3': 'Medium Orchid', '#9370DB': 'Medium Purple', '#8A2BE2': 'Blue Violet',
  '#9400D3': 'Dark Violet', '#9932CC': 'Dark Orchid', '#8B008B': 'Dark Magenta', '#4B0082': 'Indigo',
  '#F5F5DC': 'Beige', '#FFE4C4': 'Bisque', '#FFEBCD': 'Blanched Almond', '#DEB887': 'Burlywood',
  '#D2B48C': 'Tan', '#BC8F8F': 'Rosy Brown', '#F4A460': 'Sandy Brown', '#DAA520': 'Goldenrod',
  '#B8860B': 'Dark Goldenrod', '#CD853F': 'Peru', '#8B4513': 'Saddle Brown', '#A0522D': 'Sienna',
  '#696969': 'Dim Gray', '#708090': 'Slate Gray', '#778899': 'Light Slate Gray',
  '#2F4F4F': 'Dark Slate Gray', '#DCDCDC': 'Gainsboro', '#D3D3D3': 'Light Gray', '#A9A9A9': 'Dark Gray',
  '#FFFAF0': 'Floral White', '#FDF5E6': 'Old Lace', '#FAF0E6': 'Linen', '#FAEBD7': 'Antique White',
  '#F5F5F5': 'White Smoke', '#FFF5EE': 'Seashell', '#F0FFF0': 'Honeydew', '#F5FFFA': 'Mint Cream',
  '#F0FFFF': 'Azure', '#F0F8FF': 'Alice Blue', '#E0FFFF': 'Light Cyan', '#FFFFF0': 'Ivory',
};

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

export const getClosestColorName = (hex: string): { name: string; distance: number } => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { name: 'Unknown', distance: 0 };

  let closestName = 'Unknown';
  let minDistance = Infinity;

  Object.entries(colorNames).forEach(([namedHex, name]) => {
    const namedRgb = hexToRgb(namedHex);
    if (!namedRgb) return;

    // Calculate Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb.r - namedRgb.r, 2) +
      Math.pow(rgb.g - namedRgb.g, 2) +
      Math.pow(rgb.b - namedRgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestName = name;
    }
  });

  return { name: closestName, distance: minDistance };
};