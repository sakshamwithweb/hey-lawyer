// lib/messageBuffer.js
import logger from './logger';

const SESSION_CLEANUP_INTERVAL = 300000; // 5 minutes
const SESSION_TIMEOUT = 3600000; // 1 hour

class MessageBuffer {
    constructor() {
        this.buffers = new Map();
        this.lastCleanup = Date.now();

        // Schedule periodic cleanup
        setInterval(() => this.cleanupOldSessions(), SESSION_CLEANUP_INTERVAL);
    }

    getBuffer(sessionId) {
        const currentTime = Date.now();

        if (!this.buffers.has(sessionId)) {
            this.buffers.set(sessionId, {
                messages: [],
                triggerDetected: false,
                triggerTime: 0,
                collectedQuestion: [],
                responseSent: false,
                partialTrigger: false,
                partialTriggerTime: 0,
                lastActivity: currentTime
            });
            logger.debug(`Initialized new buffer for session: ${sessionId}`);
        } else {
            const buffer = this.buffers.get(sessionId);
            buffer.lastActivity = currentTime;
            logger.debug(`Updated last activity for session: ${sessionId}`);
        }

        return this.buffers.get(sessionId);
    }

    cleanupOldSessions() {
        const currentTime = Date.now();
        for (const [sessionId, data] of this.buffers.entries()) {
            if (currentTime - data.lastActivity > SESSION_TIMEOUT) {
                this.buffers.delete(sessionId);
                logger.info(`Cleaned up inactive session: ${sessionId}`);
            }
        }
        this.lastCleanup = currentTime;
    }

    getActiveSessionCount() {
        return this.buffers.size;
    }
}

// Singleton instance
const messageBuffer = new MessageBuffer();

export default messageBuffer;
