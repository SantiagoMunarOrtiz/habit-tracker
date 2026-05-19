import { Achievements } from './Achievements';
import type { User } from '../types';

export function Rewards({ user }: { user: User }) {
  // We can pass the user directly to the Achievements component,
  // which will display the badges, progress, and whether it's complete
  return (
    <div className="text-white p-6">
      <Achievements user={user} />
    </div>
  );
}
