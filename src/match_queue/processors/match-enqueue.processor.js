import { addToWaitingList, checkWaitingList } from '../match-queue.js';
import matchQueueRedis from '../match-queue.redis.js';

const enqueueProcessor = (job, done) => {
  try {
    console.log('enqueue job data: ', job.data);
    // console.log('enqueue job:', job);

    // 대기열에 유저 추가
    addToWaitingList(job.data);

    // 유저 인원 충분할 시 매칭
    checkWaitingList(job.data.dungeonCode);

    // matchQueueRedis.addToWaitingQueue(job.data, Date.now());
    console.log('Enqueue completed.');
    done();
  } catch (err) {
    console.error('Enqueue error:', err);
  }
};

export default enqueueProcessor;
