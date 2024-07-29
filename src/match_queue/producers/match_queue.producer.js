import Bull from 'bull';
import User from '../../classes/models/user.class.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { MATCH_ENQUEUE_JOB_NAME, MATCH_QUEUE_NAME } from '../../constants/match.constants.js';
import { setProcessors } from '../consumers/match_queue.consumer.js';

const matchQueue = new Bull(MATCH_QUEUE_NAME);
setProcessors();

/**
 *
 * @param {number} dungeonCode
 * @param {User} user
 */
export const matchEnqueue = async (dungeonCode, user) => {
  if (!(user instanceof User)) {
    throw new CustomError(
      ErrorCodes.INVALID_ARGUMENT,
      `user가 User 클래스의 인스턴스가 아닙니다. ${user}`,
    );
  }

  const data = {
    dungeonCode,
    user,
  };

  console.log('matchEnqueue called');
  matchQueue.add(MATCH_ENQUEUE_JOB_NAME, data);
  // checkAndResume(); // await?
};
