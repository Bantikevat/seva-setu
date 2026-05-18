/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_URL:    string;
  readonly VITE_USER_URL:    string;
  readonly VITE_WORKER_URL:  string;
  readonly VITE_BOOKING_URL: string;
  readonly VITE_PAYMENT_URL: string;
  readonly VITE_AI_URL:      string;
  readonly VITE_ADMIN_URL:   string;
  readonly VITE_FIREBASE_API_KEY?:        string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?:    string;
  readonly VITE_FIREBASE_PROJECT_ID?:     string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_SENDER_ID?:      string;
  readonly VITE_FIREBASE_APP_ID?:         string;
  readonly VITE_FIREBASE_VAPID_KEY?:      string;
  readonly VITE_RAZORPAY_KEY_ID?:         string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
