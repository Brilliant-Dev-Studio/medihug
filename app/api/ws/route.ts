import { NextRequest } from 'next/server';
import { experimental_upgradeWebSocket, type WebSocket, type WebSocketData } from '@vercel/functions';
import { verifyAdminToken, verifyDoctorToken, verifyPartnerToken } from '@/lib/jwt';
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
    console.log(`[ws] redis message on ${channel}, ${sockets?.size ?? 0} local socket(s)`);
    if (!sockets) return;
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) ws.send(message);
    }
  });
  sub.on('error', err => console.error('[ws] redis subscriber error:', err));
}

function subscribeLocal(channel: string, ws: WebSocket) {
  ensureSubscriber();
  let sockets = local.get(channel);
  if (!sockets) {
    sockets = new Set();
    local.set(channel, sockets);
    getSubscriber().subscribe(channel)
      .then(() => console.log(`[ws] subscribed to ${channel}`))
      .catch(err => {
        console.error(`[ws] redis subscribe FAILED (${channel}):`, err);
        // Don't leave a phantom entry claiming we're subscribed when we're not —
        // let the next connection attempt for this channel retry from scratch.
        local.delete(channel);
      });
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
  const partnerToken = req.cookies.get('partner_token')?.value;

  let userId: string | null = null;
  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    userId = payload?.id ?? null;
  } else if (doctorToken) {
    const payload = await verifyDoctorToken(doctorToken);
    userId = payload?.id ?? null;
  } else if (partnerToken) {
    const payload = await verifyPartnerToken(partnerToken);
    userId = payload?.id ?? null;
  }

  console.log(`[ws] upgrade request, userId=${userId ?? 'none (awaiting patient auth)'}`);

  return experimental_upgradeWebSocket((ws) => {
    let channel: string | null = null;

    if (userId) {
      channel = `user:${userId}`;
      console.log(`[ws] connected + subscribing immediately: ${channel}`);
      subscribeLocal(channel, ws);
    }

    // Idle WebSocket connections get silently dropped by some intermediary proxies/networks
    // (no close frame ever reaches the client, so the client-side reconnect logic never fires
    // — the socket just goes dead while still "looking" connected). A periodic ping keeps
    // traffic flowing so those proxies don't consider the connection idle, and if the socket
    // is genuinely dead (no pong back for two intervals), we terminate it ourselves so the
    // channel subscription doesn't leak and the client is forced to reconnect.
    let lastPong = Date.now();
    ws.on('pong', () => { lastPong = Date.now(); });
    const pingInterval = setInterval(() => {
      if (ws.readyState !== ws.OPEN) return;
      if (Date.now() - lastPong > 45000) { ws.terminate(); return; }
      ws.ping();
    }, 20000);

    ws.on('message', async (data: WebSocketData) => {
      if (channel) return; // already authenticated
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'auth' && msg.role === 'patient' && typeof msg.phone === 'string') {
          const user = await db.user.findUnique({ where: { phone: msg.phone }, select: { id: true } });
          if (user && ws.readyState === ws.OPEN) {
            channel = `user:${user.id}`;
            console.log(`[ws] patient auth ok, subscribing: ${channel}`);
            subscribeLocal(channel, ws);
          } else {
            console.warn(`[ws] patient auth failed — no user for phone ${msg.phone}`);
          }
        }
      } catch (err) {
        console.warn('[ws] malformed client message:', err);
      }
    });

    ws.on('close', () => {
      console.log(`[ws] closed, channel=${channel ?? 'none'}`);
      clearInterval(pingInterval);
      if (channel) unsubscribeLocal(channel, ws);
    });
  });
}
