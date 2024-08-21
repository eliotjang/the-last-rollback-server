import Bull from 'bull';
import { ENTER_TOWN_JOB_NAME, ENTER_TOWN_QUEUE_NAME } from '../../constants/constants.js';
import { setEnterTownQueue } from './consumers/enter-town.consumers.js';
import { config } from '../../config/config.js';

const enterTownQueue = new Bull(ENTER_TOWN_QUEUE_NAME, {
  redis: {
    host: config.redis.redisHost,
    port: config.redis.redisPort,
  },
});
setEnterTownQueue();

export const enqueueEnterTownJob = (data) => {
  enterTownQueue.add(ENTER_TOWN_JOB_NAME, data);
};
