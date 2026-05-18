/**
 * PRINT RECEIPT — FREE
 * Generate printable invoice / receipt
 */

interface BookingReceiptData {
  bookingNumber: string;
  categoryName: string;
  categoryEmoji: string;
  workerName: string;
  workerPhone: string;
  scheduledAt: string;
  fullAddress: string;
  basePrice: number;
  platformFee: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  rating?: number | null;
}

export const printReceipt = (booking: BookingReceiptData) => {
  const win = window.open('', '_blank', 'width=400,height=600');
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt — ${booking.bookingNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          padding: 30px 20px;
          color: #0F172A;
          max-width: 380px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px dashed #ddd; }
        .logo { font-size: 36px; }
        .brand { font-size: 22px; font-weight: 800; letter-spacing: 3px; color: #FF6B35; margin: 8px 0 4px; }
        .tag { font-size: 11px; color: #888; }
        .booking-num { font-family: monospace; font-size: 14px; margin-top: 12px; font-weight: 600; }

        .section { margin: 20px 0; }
        .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 4px; }
        .value { font-size: 14px; font-weight: 600; }

        .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .row.total { padding-top: 10px; border-top: 2px dashed #ddd; margin-top: 10px; font-size: 16px; font-weight: 800; }
        .row.total .amount { color: #FF6B35; }

        .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status.paid { background: #DCFCE7; color: #16A34A; }
        .status.completed { background: #DBEAFE; color: #1E40AF; }

        .footer { text-align: center; padding-top: 20px; border-top: 2px dashed #ddd; margin-top: 30px; font-size: 11px; color: #888; }
        .footer-tag { color: #FF6B35; font-weight: 700; margin-top: 8px; }

        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏠</div>
        <div class="brand">SEVA SETU</div>
        <div class="tag">Premium Home Services</div>
        <div class="booking-num">#${booking.bookingNumber}</div>
        <div style="margin-top: 8px;">
          <span class="status ${booking.paymentStatus}">${booking.paymentStatus}</span>
        </div>
      </div>

      <div class="section">
        <div class="label">Service</div>
        <div class="value">${booking.categoryEmoji} ${booking.categoryName}</div>
      </div>

      <div class="section">
        <div class="label">Worker</div>
        <div class="value">${booking.workerName}</div>
        <div style="font-size: 12px; color: #888;">${booking.workerPhone}</div>
      </div>

      <div class="section">
        <div class="label">Scheduled At</div>
        <div class="value">${new Date(booking.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div class="section">
        <div class="label">Service Address</div>
        <div class="value" style="font-size: 13px;">${booking.fullAddress}</div>
      </div>

      <div class="section" style="background: #FFF5F0; padding: 15px; border-radius: 12px;">
        <div class="label">Bill Details</div>
        <div class="row">
          <span>Service charge</span>
          <span>₹${booking.basePrice}</span>
        </div>
        <div class="row">
          <span>Platform fee</span>
          <span>₹${booking.platformFee}</span>
        </div>
        <div class="row total">
          <span>Total</span>
          <span class="amount">₹${booking.totalAmount}</span>
        </div>
      </div>

      ${booking.rating ? `
      <div class="section" style="text-align: center;">
        <div class="label">Your Rating</div>
        <div style="font-size: 24px;">${'⭐'.repeat(booking.rating)}</div>
      </div>
      ` : ''}

      <div class="footer">
        <div>Thank you for using Seva Setu!</div>
        <div class="footer-tag">Ghar Ki Har Zaroorat, Ek App Mein</div>
        <div style="margin-top: 12px; font-size: 10px;">
          Generated: ${new Date().toLocaleString('en-IN')}<br>
          Support: help@sevasetu.in
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background: #FF6B35; color: white; border: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer;">
          🖨️ Print Receipt
        </button>
      </div>

      <script>
        // Auto-trigger print on load
        setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `);
  win.document.close();
};
