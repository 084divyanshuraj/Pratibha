import React from 'react';
import './AnimatedDiagonalPanel.css';

/**
 * AnimatedDiagonalPanel
 * Renders the layered diagonal panel with a luminous cyan/blue glow border
 * inspired by the reference animation video and login-register (2).html,
 * seamlessly harmonized with PRATIBHA's institutional brand aesthetic.
 */
export default function AnimatedDiagonalPanel({
  mode = 'login', // 'login' | 'register'
  panelRef,
  beamRef,
}) {
  return (
    <div
      ref={panelRef}
      className={`pratibha-diagonal-panel-wrapper mode-${mode}`}
      aria-hidden="true"
    >
      {/* Layer 1: Diagonal Gradient Backdrop */}
      <div className="pratibha-diagonal-surface">
        {/* Subtle decorative mesh / radiant highlight inside the moving panel */}
        <div className="pratibha-diagonal-glow-radial" />
      </div>

      {/* Layer 2: Luminous Cyan/Teal Glowing Slanted Border Beam */}
      <div ref={beamRef} className="pratibha-luminous-beam" />
    </div>
  );
}
