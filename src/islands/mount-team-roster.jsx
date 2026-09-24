import { createRoot } from 'react-dom/client';
import TeamRoster from './TeamRoster.jsx';

export default function mountTeamRoster(host) {
  createRoot(host).render(<TeamRoster />);
}
