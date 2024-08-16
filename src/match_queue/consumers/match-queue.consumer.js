import Bull from 'bull';
import {
  MATCH_DEQUEUE_JOB_NAME,
  MATCH_ENQUEUE_JOB_NAME,
  MATCH_QUEUE_NAME,
} from '../../constants/match.constants.js';
import enqueueProcessor from '../processors/match-enqueue.processor.js';
import DequeueProcessor from '../processors/match-dequeue.processor.js';
import { initWaitingLists } from '../match-queue.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME);

export const setProcessors = () => {
  initWaitingLists();
  matchQueue.process(MATCH_ENQUEUE_JOB_NAME, enqueueProcessor);
  matchQueue.process(MATCH_DEQUEUE_JOB_NAME, DequeueProcessor);
};
