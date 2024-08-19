import Bull from 'bull';
import { ENTER_TOWN_JOB_NAME, ENTER_TOWN_QUEUE_NAME } from '../../../constants/constants.js';
import EnterTownProcessor from '../processors/enter-town.processor.js';

const enterTownQueue = new Bull(ENTER_TOWN_QUEUE_NAME);

export const setEnterTownQueue = () => {
  enterTownQueue.process(ENTER_TOWN_JOB_NAME, EnterTownProcessor);
};
