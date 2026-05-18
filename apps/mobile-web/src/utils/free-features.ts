/**
 * FREE FEATURES — Zero cost utilities
 * -------------------------------------------------
 * - UPI Direct Pay (no Razorpay needed)
 * - WhatsApp Share (no API needed)
 * - Geolocation (browser API)
 * - Voice Recognition (Web Speech API)
 * - Web Share API
 * - Browser Notifications
 * - Image Compression
 */

// ─────────────────────────────────────────
//  1. UPI DIRECT PAYMENT — FREE
// ─────────────────────────────────────────
/**
 * Generate UPI deep link
 * User can pay directly via GPay, PhonePe, Paytm — no Razorpay fee!
 *
 * Example:
 *   const link = getUpiLink('seva@paytm', 329, 'SEV-2026-000001');
 *   window.location.href = link;
 */
export const getUpiLink = (
  upiId: string,
  amount: number,
  note: string,
  merchantName: string = 'Seva Setu'
): string => {
  const params = new URLSearchParams({
    pa: upiId,           // payee address
    pn: merchantName,    // payee name
    am: String(amount),  // amount
    cu: 'INR',           // currency
    tn: note,            // transaction note
  });
  return `upi://pay?${params.toString()}`;
};

/**
 * Open UPI app to make payment
 */
export const payViaUpi = (upiId: string, amount: number, bookingNumber: string) => {
  const link = getUpiLink(upiId, amount, `Payment for ${bookingNumber}`);
  window.location.href = link;
};

// ─────────────────────────────────────────
//  2. WHATSAPP SHARE — FREE
// ─────────────────────────────────────────
export const whatsAppShare = (phone: string, message: string) => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const whatsAppShareBooking = (phone: string, booking: any) => {
  const message = `🏠 *Seva Setu Booking Confirmed!*\n\n📋 #${booking.bookingNumber}\n🔧 ${booking.categoryName}\n👤 ${booking.workerName}\n💰 ₹${booking.totalAmount}\n\nTrack: localhost:5173/tracking/${booking.id}`;
  whatsAppShare(phone, message);
};

// ─────────────────────────────────────────
//  3. WEB SHARE API — FREE
// ─────────────────────────────────────────
export const shareNative = async (data: { title: string; text: string; url?: string }) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      return false;
    }
  }
  // Fallback to clipboard
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${data.text} ${data.url || ''}`);
    return true;
  }
  return false;
};

// ─────────────────────────────────────────
//  4. GEOLOCATION — FREE (Browser API)
// ─────────────────────────────────────────
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

// ─────────────────────────────────────────
//  5. VOICE RECOGNITION — FREE (Web Speech API)
// ─────────────────────────────────────────
export const startVoiceRecognition = (
  onResult: (text: string) => void,
  lang: string = 'hi-IN'  // Hindi by default!
): { stop: () => void } | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    const text = Array.from(event.results)
      .map((r: any) => r[0].transcript)
      .join('');
    onResult(text);
  };

  recognition.start();
  return { stop: () => recognition.stop() };
};

// ─────────────────────────────────────────
//  6. BROWSER NOTIFICATIONS — FREE
// ─────────────────────────────────────────
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options,
    } as any);
  }
};

// ─────────────────────────────────────────
//  7. IMAGE COMPRESSION — FREE
// ─────────────────────────────────────────
export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ─────────────────────────────────────────
//  8. QR CODE GENERATION — FREE
// ─────────────────────────────────────────
/**
 * Generate QR code URL using free public API
 * Uses qrserver.com - no API key needed, completely free
 */
export const getQrCodeUrl = (data: string, size: number = 200): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

// ─────────────────────────────────────────
//  9. PWA INSTALL PROMPT
// ─────────────────────────────────────────
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export const canInstallPWA = () => !!deferredPrompt;

export const installPWA = async () => {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
};

// ─────────────────────────────────────────
//  10. CLIPBOARD COPY
// ─────────────────────────────────────────
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
