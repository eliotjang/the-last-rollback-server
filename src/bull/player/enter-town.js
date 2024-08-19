import Bull from 'bull';
import { ENTER_TOWN_JOB_NAME, ENTER_TOWN_QUEUE_NAME } from '../../constants/constants.js';
import { setEnterTownQueue } from './consumers/enter-town.consumers.js';

const enterTownQueue = new Bull(ENTER_TOWN_QUEUE_NAME);
setEnterTownQueue();

export const enqueueEnterTownJob = (data) => {
  enterTownQueue.add(ENTER_TOWN_JOB_NAME, data);
};
