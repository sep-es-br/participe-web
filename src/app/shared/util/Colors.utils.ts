export const colorsPalette = [
  '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#B10DC9',
  '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE',
];

export const getColorBasedOnText = (text: string) => {
  if (typeof text !== 'string') {
    return colorsPalette[0];
  }
  const totalCharCode = text.toLowerCase().replace(/ /g, '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colorsPalette[totalCharCode % colorsPalette.length];
};

export const getRandomColor = () => {
  return colorsPalette[Math.floor(Math.random() * colorsPalette.length)];
};

