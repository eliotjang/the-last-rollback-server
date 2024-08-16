import { addToWaitingList, checkWaitingList } from '../match-queue.js';

const enqueueProcessor = (job, done) => {
  try {
    console.log('enqueue job data: ', job.data);

    // 대기열에 유저 추가
    addToWaitingList(job.data);

    // 유저 인원 충분할 시 매칭
    checkWaitingList(job.data.dungeonCode);

    console.log('Enqueue completed.');
    done();
  } catch (err) {
    console.error('Enqueue error:', err);
  }
};

export default enqueueProcessor;
