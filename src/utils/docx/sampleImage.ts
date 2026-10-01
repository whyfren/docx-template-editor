/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates a clean, professional sample photo as a base64 Data URL (PNG)
 * entirely client-side using HTML5 Canvas.
 */
export function generateSamplePhotoDataUrl(
  name: string = 'Frentis Radytia',
  type: 'pas_foto' | 'logo' | 'general' = 'pas_foto'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'pas_foto') {
    // Standard 3:4 Indonesian Pas Foto (red or blue background)
    canvas.width = 300;
    canvas.height = 400;

    // Classic blue formal background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 400);
    bgGrad.addColorStop(0, '#1e40af'); // blue-800
    bgGrad.addColorStop(1, '#1d4ed8'); // blue-700
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 300, 400);

    // Subtle lighting vignette
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(150, 160, 140, 0, Math.PI * 2);
    ctx.fill();

    // Suit / Formal Collar (Dark Charcoal)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(30, 400);
    ctx.quadraticCurveTo(150, 260, 270, 400);
    ctx.closePath();
    ctx.fill();

    // White shirt collar
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(110, 290);
    ctx.lineTo(150, 350);
    ctx.lineTo(190, 290);
    ctx.closePath();
    ctx.fill();

    // Red necktie
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(144, 295);
    ctx.lineTo(156, 295);
    ctx.lineTo(158, 400);
    ctx.lineTo(142, 400);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e2a77a';
    ctx.fillRect(132, 230, 36, 65);

    // Head / Face
    ctx.fillStyle = '#f5c29a';
    ctx.beginPath();
    ctx.ellipse(150, 170, 60, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(150, 145, 66, Math.PI * 0.9, Math.PI * 2.1);
    ctx.closePath();
    ctx.fill();

    // Label at bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAS FOTO RESMI', 150, 385);
  } else if (type === 'logo') {
    // Square company logo
    canvas.width = 300;
    canvas.height = 300;

    // Clean gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 300, 300);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 300, 300);

    // Geometric logo icon
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, 180, 180);

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(150, 150, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CORPORATE LOGO', 150, 275);
  } else {
    // General photo placeholder
    canvas.width = 300;
    canvas.height = 200;
    ctx.fillStyle = '#e0e7ff';
    ctx.fillRect(0, 0, 300, 200);

    ctx.fillStyle = '#4338ca';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 150, 105);
  }

  return canvas.toDataURL('image/png');
}
