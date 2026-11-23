import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import AimTrainer from '../demos/AimTrainer.jsx';

export default function AimTrainerPage() {
  usePageTitle('Aim Trainer');
  return (
    <div className="container stack">
      <p>
        <Link to="/tools">← All tools</Link>
      </p>
      <h1>Aim Trainer</h1>
      <p className="muted">A warm-up, not a replacement for a full aim trainer. Use it before your first match.</p>
      <section className="demo">
        <AimTrainer />
      </section>
    </div>
  );
}
