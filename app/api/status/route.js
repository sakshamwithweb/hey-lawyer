// app/api/status/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import messageBuffer from '../../../lib/messageBuffer';

let startTime = Date.now();

export async function GET() {
  try {
    const currentTime = Date.now();
    const uptime = currentTime - startTime;

    const activeSessions = await messageBuffer.getActiveSessionCount();

    logger.info("Fetching server status");

    return NextResponse.json(
      {
        active_sessions: activeSessions,
        uptime_seconds: Math.floor(uptime / 1000),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error fetching server status: ${error.message}`);
    return NextResponse.json(
      {
        active_sessions: 0,
        uptime_seconds: 0,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
