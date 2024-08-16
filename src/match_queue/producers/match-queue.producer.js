import Bull from 'bull';
import {
  MATCH_DEQUEUE_JOB_NAME,
  MATCH_ENQUEUE_JOB_NAME,
  MATCH_QUEUE_NAME,
} from '../../constants/match.constants.js';
import { setProcessors } from '../consumers/match-queue.consumer.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME);
setProcessors();

/**
 *
 * @param {number} dungeonCode
 * @param {string} accountId
 */
export const matchEnqueue = async (dungeonCode, accountId) => {
  const data = {
    dungeonCode,
    accountId,
  };
  console.log('matchEnqueue called');
  matchQueue.add(MATCH_ENQUEUE_JOB_NAME, data);
};

export const matchDequeue = async (accountId) => {
  const data = {
    accountId,
  };
  console.log('matchDequeue called');
  matchQueue.add(MATCH_DEQUEUE_JOB_NAME, data);
};
