import Bull from 'bull';
import {
  MATCH_DEQUEUE_JOB_NAME,
  MATCH_ENQUEUE_JOB_NAME,
  MATCH_QUEUE_NAME,
} from '../../constants/match.constants.js';
import enqueueProcessor from '../processors/match-enqueue.processor.js';
import DequeueProcessor from '../processors/match-dequeue.processor.js';
import { initWaitingLists } from '../match-queue.js';
import { config } from '../../config/config.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME, {
  redis: {
    host: config.redis.redisHost,
    port: config.redis.redisPort,
  },
});

export const setProcessors = () => {
  console.log('setProcessors 확인');
  initWaitingLists();
  matchQueue.process(MATCH_ENQUEUE_JOB_NAME, enqueueProcessor);
  matchQueue.process(MATCH_DEQUEUE_JOB_NAME, DequeueProcessor);
};
