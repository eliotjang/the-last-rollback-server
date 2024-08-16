import { clearFromWaitingLists } from '../match-queue.js';

const DequeueProcessor = (job, done) => {
  try {
    clearFromWaitingLists(job.data.accountId);
    console.log('Dequeue completed.');
    done();
  } catch (err) {
    console.error('Dequeue error:', err);
  }
};

export default DequeueProcessor;
