const pct = (value) => `${value * 100}%`;
const clamp01 = (value) => Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000;

// Draws a map with its callouts and lineups. Used by the lineup viewer and the admin map editor.
// Items not saved yet have no id, so the editor gives them a `key` instead.
export default function MapStage({ map, selectedId, onSelect, showCallouts = true, kind = '', onStageClick }) {
  const lineups = map.lineups.filter((lineup) => !kind || lineup.kind === kind);
  const selected = lineups.find((lineup) => (lineup.id ?? lineup.key) === selectedId);

  function handleStageClick(event) {
    if (!onStageClick) return;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    onStageClick({ x: clamp01((event.clientX - left) / width), y: clamp01((event.clientY - top) / height) });
  }

  return (
    <div className={onStageClick ? 'map-stage editing' : 'map-stage'} onClick={handleStageClick}>
      <img src={map.imageUrl} alt={`Map of ${map.name}`} />
      <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ color: 'var(--accent)' }}>
        {selected && (
          <line
            x1={selected.from.x * 100}
            y1={selected.from.y * 100}
            x2={selected.to.x * 100}
            y2={selected.to.y * 100}
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="2 1.5"
          />
        )}
      </svg>
      {showCallouts &&
        map.callouts.map((callout) => (
          <span key={callout.id ?? callout.key} className="map-callout" style={{ left: pct(callout.x), top: pct(callout.y) }}>
            {callout.name}
          </span>
        ))}
      {lineups.map((lineup) => {
        const id = lineup.id ?? lineup.key;
        const isSelected = lineup === selected;
        return (
          <button
            key={id}
            type="button"
            className={isSelected ? 'map-marker selected' : 'map-marker'}
            style={{ left: pct(lineup.to.x), top: pct(lineup.to.y) }}
            aria-label={`${lineup.title} (${lineup.kind})`}
            aria-pressed={isSelected}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(id);
            }}
          />
        );
      })}
      {selected && (
        <span className="map-marker from" style={{ left: pct(selected.from.x), top: pct(selected.from.y) }} aria-hidden="true" />
      )}
    </div>
  );
}
