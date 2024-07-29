import { addToWaitingList, checkWaitingList } from '../match_queue.js';

const enqueueProcessor = (job, done) => {
  console.log('?: ', job.data);

  // 대기열에 유저 추가
  addToWaitingList(job.data);

  // 유저 인원 충분할 시 매칭
  checkWaitingList(job.data.dungeonCode);
  console.log('Enqueue completed.');
  done();
};

export default enqueueProcessor;
