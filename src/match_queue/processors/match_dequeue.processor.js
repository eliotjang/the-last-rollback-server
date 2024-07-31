import { clearFromWaitingLists } from '../match_queue.js';

const DequeueProcessor = (job, done) => {
  //
  // console.log('dequeue job data:', job.data);
  clearFromWaitingLists(job.data.user);
  console.log('Dequeue completed.');
  done();
};

export default DequeueProcessor;
