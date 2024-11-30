// lib/messageBuffer.js
import logger from './logger';
import dbConnect from './mongodb';
import Session from '@/models/Session';

const SESSION_TIMEOUT = 3600000; // 1 hour in ms

class MessageBuffer {
  constructor() {
    // No need for in-memory Map
  }

  /**
   * Retrieve a session buffer from MongoDB or create a new one if it doesn't exist.
   * @param {String} sessionId - Unique identifier for the session.
   * @returns {Object} - Session data.
   */
  async getBuffer(sessionId) {
    await dbConnect();

    let session = await Session.findOne({ sessionId });

    if (!session) {
      session = await Session.create({
        sessionId,
      });
      logger.debug(`Initialized new buffer for session: ${sessionId}`);
    } else {
      // Update lastActivity
      session.lastActivity = Date.now();
      await session.save();
      logger.debug(`Retrieved existing buffer for session: ${sessionId}`);
    }

    return session;
  }

  /**
   * Update a session buffer in MongoDB.
   * @param {String} sessionId - Unique identifier for the session.
   * @param {Object} updates - Fields to update.
   */
  async updateBuffer(sessionId, updates) {
    await dbConnect();

    await Session.findOneAndUpdate(
      { sessionId },
      { ...updates, lastActivity: Date.now() },
      { new: true }
    );
  }

  /**
   * Get the count of active sessions.
   * @returns {Number} - Number of active sessions.
   */
  async getActiveSessionCount() {
    await dbConnect();
    const count = await Session.countDocuments();
    return count;
  }

  /**
   * Cleanup is handled automatically by TTL indexes in MongoDB.
   */
  async cleanupOldSessions() {
    logger.info('Cleanup handled automatically by MongoDB TTL indexes.');
  }
}

// Singleton instance
const messageBuffer = new MessageBuffer();

export default messageBuffer;
