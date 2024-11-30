// app/api/webhook/setup-status/route.js
import { NextResponse } from 'next/server';
import logger from '../../../../lib/logger';

export async function GET() {
  try {
    logger.info("Checking webhook setup status");
    // Additional checks can be added here if necessary
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
