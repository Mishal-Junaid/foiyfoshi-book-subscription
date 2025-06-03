/* Base64 encoded placeholder image */
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');

// Fill with a gradient
const gradient = ctx.createLinearGradient(0, 0, 400, 400);
gradient.addColorStop(0, '#f9d9aa');
gradient.addColorStop(1, '#e2b67c');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 400, 400);

// Add text
ctx.font = 'bold 30px Arial';
ctx.fillStyle = '#8d5524';
ctx.textAlign = 'center';
ctx.fillText('FoiyFoshi', 200, 180);
ctx.font = '20px Arial';
ctx.fillText('Image Placeholder', 200, 220);

// Export as data URL
const dataUrl = canvas.toDataURL('image/jpeg');
console.log(dataUrl);
