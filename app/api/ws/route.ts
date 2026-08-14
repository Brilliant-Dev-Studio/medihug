import { NextRequest } from 'next/server';
import { experimental_upgradeWebSocket, type WebSocket, type WebSocketData } from '@vercel/functions';
import { verifyAdminToken, verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getSubscriber } from '@/lib/realtime';

/* ── Per-instance local fan-out registry: Redis channel -> sockets on this instance ── */
const local = new Map<string, Set<WebSocket>>();
let subscriberReady = false;

function ensureSubscriber() {
  if (subscriberReady) return;
  subscriberReady = true;
  const sub = getSubscriber();
  sub.on('message', (channel: string, message: string) => {
    const sockets = local.get(channel);
    if (!sockets) return;
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) ws.send(message);
    }
  });
}

function subscribeLocal(channel: string, ws: WebSocket) {
  ensureSubscriber();
  let sockets = local.get(channel);
  if (!sockets) {
    sockets = new Set();
    local.set(channel, sockets);
    getSubscriber().subscribe(channel).catch(err => console.error(`Redis subscribe failed (${channel}):`, err));
  }
  sockets.add(ws);
}

function unsubscribeLocal(channel: string, ws: WebSocket) {
  const sockets = local.get(channel);
  if (!sockets) return;
  sockets.delete(ws);
  if (sockets.size === 0) {
    local.delete(channel);
    getSubscriber().unsubscribe(channel).catch(err => console.error(`Redis unsubscribe failed (${channel}):`, err));
  }
}

/* ── GET /api/ws — upgrades to a WebSocket, one connection per logged-in user.
 * Admin/doctor identity comes from their httpOnly cookie (sent automatically on the
 * upgrade handshake). Patient has no server session, so the client sends one
 * {type:'auth', role:'patient', phone} message after connecting, same trust model
 * as every other patient API route in this app. ── */
export async function GET(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token')?.value;
  const doctorToken = req.cookies.get('doctor_token')?.value;

  let userId: string | null = null;
  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    userId = payload?.id ?? null;
  } else if (doctorToken) {
    const payload = await verifyDoctorToken(doctorToken);
    userId = payload?.id ?? null;
  }

  return experimental_upgradeWebSocket((ws) => {
    let channel: string | null = null;

    if (userId) {
      channel = `user:${userId}`;
      subscribeLocal(channel, ws);
    }

    ws.on('message', async (data: WebSocketData) => {
      if (channel) return; // already authenticated
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'auth' && msg.role === 'patient' && typeof msg.phone === 'string') {
          const user = await db.user.findUnique({ where: { phone: msg.phone }, select: { id: true } });
          if (user && ws.readyState === ws.OPEN) {
            channel = `user:${user.id}`;
            subscribeLocal(channel, ws);
          }
        }
      } catch {
        // ignore malformed frames
      }
    });

    ws.on('close', () => {
      if (channel) unsubscribeLocal(channel, ws);
    });
  });
}
