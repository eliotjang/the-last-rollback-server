import Bull from 'bull';
import { MATCH_ENQUEUE_JOB_NAME, MATCH_QUEUE_NAME } from '../../constants/match.constants.js';
import enqueueProcessor from '../processors/match_enqueue.processor.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME);

export const setProcessors = () => {
  //   matchQueue.process(MATCH_ENQUEUE_JOB_NAME, './processors/match_enqueue.processor.js');
  matchQueue.process(MATCH_ENQUEUE_JOB_NAME, enqueueProcessor);
};
// getMatchQueue().process('dequeue', dequeueProcessor);
