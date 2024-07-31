import Bull from 'bull';
import {
  MATCH_DEQUEUE_JOB_NAME,
  MATCH_ENQUEUE_JOB_NAME,
  MATCH_QUEUE_NAME,
} from '../../constants/match.constants.js';
import enqueueProcessor from '../processors/match_enqueue.processor.js';
import DequeueProcessor from '../processors/match_dequeue.processor.js';
import { initWaitingLists } from '../match_queue.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME);

export const setProcessors = () => {
  initWaitingLists();
  //   matchQueue.process(MATCH_ENQUEUE_JOB_NAME, './processors/match_enqueue.processor.js');
  matchQueue.process(MATCH_ENQUEUE_JOB_NAME, enqueueProcessor);
  matchQueue.process(MATCH_DEQUEUE_JOB_NAME, DequeueProcessor);
};
// getMatchQueue().process('dequeue', dequeueProcessor);
