import { DEMO_LABELS } from '../lib/constants.js';
import AimTrainer from './AimTrainer.jsx';
import PeekAdvantage from './PeekAdvantage.jsx';
import CounterStrafe from './CounterStrafe.jsx';
import CrosshairCompare from './CrosshairCompare.jsx';

const DEMO_COMPONENTS = {
  'aim-trainer': AimTrainer,
  'peek-advantage': PeekAdvantage,
  'counter-strafe': CounterStrafe,
  'crosshair-compare': CrosshairCompare,
};

// Renders the interactive demo a lesson asks for. Unknown or empty names render nothing.
export default function LessonDemo({ name }) {
  const Demo = DEMO_COMPONENTS[name];
  if (!Demo) return null;
  return (
    <section className="demo" aria-label={DEMO_LABELS[name]}>
      <h2>Try it: {DEMO_LABELS[name]}</h2>
      <Demo />
    </section>
  );
}
