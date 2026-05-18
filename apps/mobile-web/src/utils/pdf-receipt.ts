/**
 * PDF receipt — uses browser native print → save as PDF.
 * Zero npm dependencies.
 */
interface ReceiptData {
  bookingNumber: string;
  customerName?: string;
  workerName?: string;
  categoryName?: string;
  scheduledAt?: string;
  address?: string;
  basePrice?: number;
  platformFee?: number;
  totalAmount?: number;
  paymentStatus?: string;
}

export const generatePdfReceipt = (data: ReceiptData) => {
  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Receipt #${data.bookingNumber}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
      body{padding:40px;color:#0F172A;max-width:600px;margin:0 auto}
      .h{text-align:center;border-bottom:3px solid #FF6B35;padding-bottom:20px;margin-bottom:30px}
      .h h1{color:#FF6B35;font-size:32px;letter-spacing:-1px}
      .h p{color:#64748B;font-size:13px;margin-top:5px}
      .b{margin:30px 0}
      .r{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #F1F5F9}
      .r .k{color:#64748B;font-size:13px}
      .r .v{font-weight:600;color:#0F172A}
      .tot{background:#FFF7ED;padding:20px;border-radius:12px;margin-top:20px}
      .tot .row{display:flex;justify-content:space-between;padding:5px 0}
      .tot .total{font-size:20px;font-weight:800;color:#FF6B35;padding-top:10px;border-top:2px dashed #FF6B35;margin-top:10px}
      .f{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #E2E8F0;color:#94A3B8;font-size:11px}
      @media print { body { padding: 20px; } }
    </style></head><body>
      <div class="h">
        <h1>SEVA SETU</h1>
        <p>Receipt #${data.bookingNumber}</p>
        <p>${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
      </div>
      <div class="b">
        ${data.customerName  ? `<div class="r"><span class="k">Customer</span><span class="v">${data.customerName}</span></div>` : ''}
        ${data.workerName    ? `<div class="r"><span class="k">Worker</span><span class="v">${data.workerName}</span></div>` : ''}
        ${data.categoryName  ? `<div class="r"><span class="k">Service</span><span class="v">${data.categoryName}</span></div>` : ''}
        ${data.scheduledAt   ? `<div class="r"><span class="k">Date</span><span class="v">${new Date(data.scheduledAt).toLocaleString('en-IN')}</span></div>` : ''}
        ${data.address       ? `<div class="r"><span class="k">Address</span><span class="v">${data.address}</span></div>` : ''}
        ${data.paymentStatus ? `<div class="r"><span class="k">Payment</span><span class="v">${data.paymentStatus.toUpperCase()}</span></div>` : ''}
      </div>
      <div class="tot">
        ${data.basePrice    != null ? `<div class="row"><span>Base Price</span><span>₹${data.basePrice}</span></div>` : ''}
        ${data.platformFee  != null ? `<div class="row"><span>Platform Fee</span><span>₹${data.platformFee}</span></div>` : ''}
        ${data.totalAmount  != null ? `<div class="row total"><span>Total Paid</span><span>₹${data.totalAmount}</span></div>` : ''}
      </div>
      <div class="f">
        Thank you for choosing Seva Setu<br>
        For support: +91-6464466512 · help@sevasetu.in
      </div>
      <script>window.print();</script>
    </body></html>`;

  const w = window.open('', '_blank', 'width=700,height=900');
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
};
