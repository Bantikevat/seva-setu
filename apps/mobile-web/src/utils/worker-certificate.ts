/**
 * WORKER CERTIFICATE — Generate & download a "Seva Setu Verified" PDF certificate
 * Uses canvas API — completely free, no library needed
 */

export const downloadWorkerCertificate = (worker: {
  name: string;
  categoryName?: string;
  rating?: number;
  totalJobs?: number;
  joinedAt?: string;
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 840;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#FEFCF8';
  ctx.fillRect(0, 0, 1200, 840);

  // Outer border (gold double line)
  ctx.strokeStyle = '#D4A017';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 1160, 800);
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1128, 768);

  // Header gradient bar
  const grad = ctx.createLinearGradient(0, 0, 1200, 0);
  grad.addColorStop(0, '#FF6B35');
  grad.addColorStop(1, '#FF9500');
  ctx.fillStyle = grad;
  ctx.fillRect(20, 20, 1160, 120);

  // Brand name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SEVA SETU', 600, 100);

  // Subtitle
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Ghar Ki Har Zaroorat, Ek App Mein', 600, 125);

  // Certificate title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('CERTIFICATE OF VERIFICATION', 600, 215);

  // Decorative line
  ctx.strokeStyle = '#D4A017';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(200, 235);
  ctx.lineTo(1000, 235);
  ctx.stroke();

  // Body text
  ctx.fillStyle = '#333333';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('This certifies that', 600, 290);

  // Worker name — big
  ctx.fillStyle = '#FF6B35';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText(worker.name, 600, 370);

  // Decorative underline
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 2;
  const nameWidth = ctx.measureText(worker.name).width;
  ctx.beginPath();
  ctx.moveTo(600 - nameWidth / 2, 385);
  ctx.lineTo(600 + nameWidth / 2, 385);
  ctx.stroke();

  // Category
  ctx.fillStyle = '#333333';
  ctx.font = '22px Georgia, serif';
  ctx.fillText(
    `is a Verified ${worker.categoryName || 'Home Services'} Professional`,
    600,
    435
  );
  ctx.fillText('on the Seva Setu Platform.', 600, 465);

  // Stats row
  ctx.fillStyle = '#666666';
  ctx.font = '18px Georgia, serif';
  const statsY = 530;
  if (worker.rating) {
    ctx.fillText(`★ Rating: ${worker.rating}/5.0`, 350, statsY);
  }
  if (worker.totalJobs) {
    ctx.fillText(`✓ Jobs Completed: ${worker.totalJobs}+`, 850, statsY);
  }

  // Joined date
  if (worker.joinedAt) {
    const joined = new Date(worker.joinedAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    });
    ctx.fillText(`Member Since: ${joined}`, 600, 570);
  }

  // VERIFIED STAMP circle
  ctx.save();
  ctx.translate(600, 660);
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#FF6B35';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText('✓ VERIFIED', 0, 5);
  ctx.font = '11px Arial, sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('SEVA SETU', 0, 25);
  ctx.restore();

  // Footer
  ctx.fillStyle = '#999999';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(
    `Issue Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    600,
    780
  );
  ctx.font = '12px Georgia, serif';
  ctx.fillText('© 2026 Seva Setu Technologies Pvt. Ltd. · Ujjain, Madhya Pradesh · sevasetu.in', 600, 800);

  // Download
  const link = document.createElement('a');
  link.download = `SevaSetU_Certificate_${worker.name.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};
