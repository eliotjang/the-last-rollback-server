import { clearFromWaitingLists } from '../match-queue.js';
import matchQueueRedis from '../match-queue.redis.js';

const DequeueProcessor = (job, done) => {
  try {
    // console.log('dequeue job data:', job.data);
    clearFromWaitingLists(job.data.accountId);
    // matchQueueRedis.removeFromWaitingQueue(job.data.dungeonCode, job.data.user.accountId);
    console.log('Dequeue completed.');
    done();
  } catch (err) {
    console.error('Dequeue error:', err);
  }
};

export default DequeueProcessor;
