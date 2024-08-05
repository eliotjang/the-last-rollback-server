import Bull from 'bull';
import {
  MATCH_DEQUEUE_JOB_NAME,
  MATCH_ENQUEUE_JOB_NAME,
  MATCH_QUEUE_NAME,
  MATCH_QUEUE_RETRIEVAL,
} from '../../constants/match.constants.js';
import enqueueProcessor from '../processors/match-enqueue.processor.js';
import DequeueProcessor from '../processors/match-dequeue.processor.js';
import checkQueueProcessor from '../processors/check-queue.processor.js';
import { initWaitingLists } from '../match-queue.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME);

export const setProcessors = () => {
  initWaitingLists();
  //   matchQueue.process(MATCH_ENQUEUE_JOB_NAME, './processors/match_enqueue.processor.js');
  matchQueue.process(MATCH_ENQUEUE_JOB_NAME, enqueueProcessor);
  matchQueue.process(MATCH_DEQUEUE_JOB_NAME, DequeueProcessor);
  // matchQueue.process(MATCH_QUEUE_RETRIEVAL, checkQueueProcessor);
};
// getMatchQueue().process('dequeue', dequeueProcessor);
