import { addTownSession, getAllTownSessions } from '../../../session/town.session.js';
import { getUserById } from '../../../session/user.session.js';

const EnterTownProcessor = async (job) => {
  const { accountId } = job.data;
  const user = getUserById(accountId);
  const townSessions = getAllTownSessions();
  let townSession = townSessions.find((townSession) => !townSession.isFull());
  if (!townSession) {
    townSession = addTownSession();
  }
  await townSession.addUser(user);
};

export default EnterTownProcessor;
