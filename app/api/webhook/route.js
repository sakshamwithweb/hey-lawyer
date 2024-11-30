// app/api/webhook/route.js
import { NextResponse } from 'next/server';
import logger from '../../../lib/logger';
import messageBuffer from '../../../lib/messageBuffer';
import getOpenAIResponse from '../../../lib/openAI';

// --------------------------- Configuration ---------------------------
const TRIGGER_PHRASES = ["hey lawyer", "hey, lawyer"];
const PARTIAL_FIRST = ["hey", "hey,"];
const PARTIAL_SECOND = ["lawyer"];
const QUESTION_AGGREGATION_TIME = 5000; // in ms
const NOTIFICATION_COOLDOWN = 10000; // in ms

// --------------------------- Cooldown Management ---------------------------
const notificationCooldowns = new Map();

function isCooldownActive(sessionId) {
  const currentTime = Date.now();
  if (notificationCooldowns.has(sessionId)) {
    const lastNotification = notificationCooldowns.get(sessionId);
    if (currentTime - lastNotification < NOTIFICATION_COOLDOWN) {
      const remaining = Math.ceil(
        (NOTIFICATION_COOLDOWN - (currentTime - lastNotification)) / 1000
      );
      logger.info(
        `Cooldown active for session ${sessionId}. ${remaining}s remaining.`
      );
      return true;
    }
  }
  return false;
}

export async function POST(request) {
  logger.info("Received webhook POST request");

  let data;
  try {
    data = await request.json();
  } catch (error) {
    logger.error(`Failed to parse JSON: ${error.message}`);
    return NextResponse.json(
      { status: "error", message: "Invalid JSON" },
      { status: 400 }
    );
  }

  logger.debug(`Received data: ${JSON.stringify(data)}`);

  const sessionId = data.session_id;
  const uid = request.nextUrl.searchParams.get('uid');
  logger.info(`Processing request for session_id: ${sessionId}, uid: ${uid}`);

  if (!sessionId) {
    logger.error("No session_id provided in request");
    return NextResponse.json(
      { status: "error", message: "No session_id provided" },
      { status: 400 }
    );
  }

  const currentTime = Date.now();
  const session = await messageBuffer.getBuffer(sessionId);
  const segments = data.segments || [];
  let hasProcessed = false;

  logger.debug(`Current buffer state for session ${sessionId}: ${JSON.stringify(session)}`);

  // If a trigger was detected and response not yet sent
  if (session.triggerDetected && !session.responseSent) {
    if (isCooldownActive(sessionId)) {
      logger.info(`Cooldown active for session ${sessionId}. Skipping response.`);
      return NextResponse.json({ status: "success" }, { status: 200 });
    }
  }

  for (const segment of segments) {
    if (!segment.text || hasProcessed) continue;

    const text = segment.text.toLowerCase().trim();
    logger.info(`Processing text segment: "${text}"`);

    // Check for complete trigger phrases
    const lowerTriggers = TRIGGER_PHRASES.map((t) => t.toLowerCase());
    const triggerDetected = lowerTriggers.some((trigger) =>
      text.includes(trigger)
    );

    if (triggerDetected && !session.triggerDetected) {
      logger.info(`Complete trigger phrase detected in session ${sessionId}`);
      // Update session
      await messageBuffer.updateBuffer(sessionId, {
        triggerDetected: true,
        triggerTime: new Date(),
        collectedQuestion: [],
        responseSent: false,
        partialTrigger: false,
      });
      notificationCooldowns.set(sessionId, currentTime);

      // Extract question part after trigger
      let questionPart = '';
      for (const trigger of lowerTriggers) {
        if (text.includes(trigger)) {
          const parts = text.split(trigger);
          if (parts.length > 1) {
            questionPart = parts.slice(1).join(trigger).trim();
            break;
          }
        }
      }
      if (questionPart) {
        await messageBuffer.updateBuffer(sessionId, {
          collectedQuestion: [questionPart],
        });
        logger.info(`Collected question part from trigger: "${questionPart}"`);
      }
      continue;
    }

    // Handle partial trigger detection
    if (!session.triggerDetected) {
      const endsWithPartialFirst = PARTIAL_FIRST.some((part) =>
        text.endsWith(part.toLowerCase())
      );
      if (endsWithPartialFirst) {
        logger.info(`First part of trigger detected in session ${sessionId}`);
        await messageBuffer.updateBuffer(sessionId, {
          partialTrigger: true,
          partialTriggerTime: new Date(),
        });
        continue;
      }

      if (session.partialTrigger) {
        const timeSincePartial =
          currentTime - new Date(session.partialTriggerTime).getTime();
        if (timeSincePartial <= 2000) {
          const hasPartialSecond = PARTIAL_SECOND.some((part) =>
            text.includes(part.toLowerCase())
          );
          if (hasPartialSecond) {
            logger.info(
              `Complete trigger detected across segments in session ${sessionId}`
            );
            await messageBuffer.updateBuffer(sessionId, {
              triggerDetected: true,
              triggerTime: new Date(),
              collectedQuestion: [],
              responseSent: false,
              partialTrigger: false,
            });
            notificationCooldowns.set(sessionId, currentTime);

            // Extract question part after partial trigger
            let questionPart = '';
            for (const part of PARTIAL_SECOND) {
              if (text.includes(part.toLowerCase())) {
                const parts = text.split(part.toLowerCase());
                if (parts.length > 1) {
                  questionPart = parts.slice(1).join(part.toLowerCase()).trim();
                  break;
                }
              }
            }
            if (questionPart) {
              await messageBuffer.updateBuffer(sessionId, {
                collectedQuestion: [questionPart],
              });
              logger.info(
                `Collected question part from second trigger part: "${questionPart}"`
              );
            }
            continue;
          }
        } else {
          logger.info(`Partial trigger timed out for session ${sessionId}`);
          await messageBuffer.updateBuffer(sessionId, {
            partialTrigger: false,
          });
        }
      }
    }

    // Collecting question parts after trigger detection
    if (session.triggerDetected && !session.responseSent && !hasProcessed) {
      const timeSinceTrigger =
        currentTime - new Date(session.triggerTime).getTime();
      logger.info(`Time since trigger: ${Math.floor(timeSinceTrigger / 1000)}s`);

      if (timeSinceTrigger <= QUESTION_AGGREGATION_TIME) {
        const updatedCollectedQuestion = [
          ...session.collectedQuestion,
          segment.text,
        ];
        await messageBuffer.updateBuffer(sessionId, {
          collectedQuestion: updatedCollectedQuestion,
        });
        logger.info(`Collecting question part: "${segment.text}"`);
        logger.debug(
          `Current collected question: "${updatedCollectedQuestion.join(' ')}"`
        );
      }

      // Determine if it's time to process the collected question
      const shouldProcess =
        (timeSinceTrigger > QUESTION_AGGREGATION_TIME &&
          session.collectedQuestion.length > 0) ||
        session.collectedQuestion.join(' ').includes('?') ||
        timeSinceTrigger > QUESTION_AGGREGATION_TIME * 1.5;

      if (shouldProcess && session.collectedQuestion.length > 0) {
        let fullQuestion = session.collectedQuestion.join(' ').trim();
        if (!fullQuestion.endsWith('?')) {
          fullQuestion += '?';
        }

        logger.info(`Processing complete question: "${fullQuestion}"`);
        const response = await getOpenAIResponse(fullQuestion);
        logger.info(`Got response from OpenAI: "${response}"`);

        // Reset buffer state after processing
        await messageBuffer.updateBuffer(sessionId, {
          triggerDetected: false,
          triggerTime: null,
          collectedQuestion: [],
          responseSent: true,
          partialTrigger: false,
        });
        hasProcessed = true;

        return NextResponse.json({ message: response }, { status: 200 });
      }
    }
  }

  return NextResponse.json({ status: "success" }, { status: 200 });
}
