import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';

config();

const vars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let content = readFileSync('public/firebase-messaging-sw.template.js', 'utf-8');
for (const key of vars) {
  content = content.replaceAll(`__${key}__`, process.env[key] ?? '');
}
writeFileSync('public/firebase-messaging-sw.js', content);
console.log('firebase-messaging-sw.js generated from template.');
