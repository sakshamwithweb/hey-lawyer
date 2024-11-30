// app/api/webhook/setup-status/route.js
import { NextResponse } from 'next/server';
import logger from '../../../../lib/logger';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    await dbConnect();
    const usercheck = await User.findOne({ omiUserId: uid });
    if (!usercheck) return NextResponse.json({ is_setup_completed: false }, { status: 400 });
    logger.info("Checking webhook setup status");
    return NextResponse.json(
      {
        is_setup_completed: true,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error checking setup status: ${error.message}`);
    return NextResponse.json(
      {
        is_setup_completed: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
