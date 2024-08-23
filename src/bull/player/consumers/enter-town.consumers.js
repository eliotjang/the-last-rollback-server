import Bull from 'bull';
import { ENTER_TOWN_JOB_NAME, ENTER_TOWN_QUEUE_NAME } from '../../../constants/constants.js';
import EnterTownProcessor from '../processors/enter-town.processor.js';
import { config } from '../../../config/config.js';

const enterTownQueue = new Bull(ENTER_TOWN_QUEUE_NAME, {
  redis: {
    host: config.redis.redisHost,
    port: config.redis.redisPort,
  },
});

export const setEnterTownQueue = () => {
  enterTownQueue.process(ENTER_TOWN_JOB_NAME, EnterTownProcessor);
};
