// src/components/ui/EnhancedDrawingControls.tsx
import React from "react";
import { useEnhancedGenericPointerEvents } from "@/hooks/useEnhancedGenericPointerEvents";

interface EnhancedDrawingControlsProps {
  pointerEvents: ReturnType<typeof useEnhancedGenericPointerEvents>;
}

export function EnhancedDrawingControls({
  pointerEvents,
}: EnhancedDrawingControlsProps) {
  const { roadDrawing, wallDrawing, waterDrawing } = pointerEvents;

  // Get current active drawing
  const activeDrawing = roadDrawing.isDrawing
    ? roadDrawing
    : wallDrawing.isDrawing
    ? wallDrawing
    : waterDrawing.isDrawing
    ? waterDrawing
    : null;

  const getDrawingIcon = () => {
    if (roadDrawing.isDrawing) return "🛣️";
    if (wallDrawing.isDrawing) return "🧱";
    if (waterDrawing.isDrawing) return "💧";
    return "🎨";
  };

  const getDrawingTypeName = () => {
    if (roadDrawing.isDrawing) return "Road";
    if (wallDrawing.isDrawing) return "Wall";
    if (waterDrawing.isDrawing) return "Water";
    return "Object";
  };

  if (!activeDrawing) return null;

  const visualConfig = activeDrawing.getVisualConfig();
  const intersections = activeDrawing.getIntersections();

  return (
    <div className="enhanced-drawing-controls">
      <div className="drawing-header">
        <span className="drawing-icon">{getDrawingIcon()}</span>
        <h3>Drawing {getDrawingTypeName()}</h3>
      </div>

      <div className="drawing-info">
        <div className="info-row">
          <span className="label">Type:</span>
          <select
            value={activeDrawing.selectedType}
            onChange={(e) => activeDrawing.setSelectedType(e.target.value)}
            className="type-selector"
          >
            {/* Road types */}
            {roadDrawing.isDrawing && (
              <>
                <option value="residential">🏘️ Residential</option>
                <option value="highway">🛣️ Highway</option>
                <option value="dirt">🌾 Dirt Road</option>
                <option value="pedestrian">🚶 Pedestrian</option>
              </>
            )}

            {/* Wall types */}
            {wallDrawing.isDrawing && (
              <>
                <option value="concrete">🏗️ Concrete</option>
                <option value="brick">🧱 Brick</option>
                <option value="wood">🪵 Wood</option>
                <option value="stone">🗿 Stone</option>
              </>
            )}

            {/* Water types */}
            {waterDrawing.isDrawing && (
              <>
                <option value="pond">🏞️ Pond</option>
                <option value="lake">🏔️ Lake</option>
                <option value="river">🌊 River</option>
                <option value="pool">🏊 Pool</option>
              </>
            )}
          </select>
        </div>

        <div className="info-row">
          <span className="label">Points:</span>
          <span className="value">{activeDrawing.tempPoints.length}</span>
        </div>

        {intersections.length > 0 && (
          <div className="info-row intersection-info">
            <span className="label">Intersections:</span>
            <span className="value highlight">{intersections.length}</span>
          </div>
        )}

        <div className="instructions">
          {activeDrawing.getDrawingInstructions()}
        </div>
      </div>

      <div className="drawing-toggles">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={activeDrawing.showPreview}
            onChange={activeDrawing.togglePreview}
          />
          <span className="toggle-icon">👁️</span>
          <span>Show Preview (P)</span>
        </label>

        {(roadDrawing.isDrawing || wallDrawing.isDrawing) && (
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={activeDrawing.showIntersections}
              onChange={activeDrawing.toggleIntersections}
            />
            <span className="toggle-icon">🔄</span>
            <span>Detect Intersections (I)</span>
          </label>
        )}

        {(roadDrawing.isDrawing || wallDrawing.isDrawing) && (
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={activeDrawing.autoOptimize}
              onChange={activeDrawing.toggleAutoOptimize}
            />
            <span className="toggle-icon">⚡</span>
            <span>Auto Optimize (O)</span>
          </label>
        )}
      </div>

      <div className="drawing-actions">
        <button
          onClick={() => activeDrawing.undoLastPoint()}
          disabled={activeDrawing.tempPoints.length === 0}
          className="action-button secondary"
        >
          ↶ Undo Point (Ctrl+Z)
        </button>

        <button
          onClick={() => activeDrawing.cancelDrawing()}
          className="action-button danger"
        >
          ❌ Cancel (Esc)
        </button>

        <button
          onClick={() => activeDrawing.finishDrawing()}
          disabled={activeDrawing.tempPoints.length < 2}
          className="action-button primary"
        >
          ✅ Finish (Enter)
        </button>

        {roadDrawing.isDrawing && activeDrawing.tempPoints.length >= 2 && (
          <button
            onClick={() => roadDrawing.addCurveToLastSegment()}
            className="action-button special"
          >
            🔄 Add Curve (C)
          </button>
        )}
      </div>

      {/* Visual Config Display */}
      {visualConfig && (
        <div className="visual-config">
          <h4>Visual Settings</h4>
          <div className="config-grid">
            {visualConfig.centerLine?.enabled && (
              <div className="config-item">
                <span className="config-label">Center Line:</span>
                <div className="config-visual">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: visualConfig.centerLine.color }}
                  />
                  <span>{visualConfig.centerLine.style}</span>
                </div>
              </div>
            )}

            {visualConfig.sideLines?.enabled && (
              <div className="config-item">
                <span className="config-label">Side Lines:</span>
                <div className="config-visual">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: visualConfig.sideLines.color }}
                  />
                  <span>{visualConfig.sideLines.style}</span>
                </div>
              </div>
            )}

            {visualConfig.curbs?.enabled && (
              <div className="config-item">
                <span className="config-label">Curbs:</span>
                <div className="config-visual">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: visualConfig.curbs.color }}
                  />
                  <span>{visualConfig.curbs.height}m</span>
                </div>
              </div>
            )}

            {visualConfig.edges?.enabled && (
              <div className="config-item">
                <span className="config-label">Edges:</span>
                <div className="config-visual">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: visualConfig.edges.color }}
                  />
                  <span>{visualConfig.edges.style}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="shortcuts">
        <h4>Shortcuts</h4>
        <div className="shortcut-grid">
          <div className="shortcut-item">
            <kbd>Enter</kbd>
            <span>Finish</span>
          </div>
          <div className="shortcut-item">
            <kbd>Esc</kbd>
            <span>Cancel</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl+Z</kbd>
            <span>Undo</span>
          </div>
          {roadDrawing.isDrawing && (
            <div className="shortcut-item">
              <kbd>C</kbd>
              <span>Curve</span>
            </div>
          )}
          <div className="shortcut-item">
            <kbd>P</kbd>
            <span>Preview</span>
          </div>
          <div className="shortcut-item">
            <kbd>I</kbd>
            <span>Intersections</span>
          </div>
          <div className="shortcut-item">
            <kbd>O</kbd>
            <span>Optimize</span>
          </div>
        </div>
      </div>
    </div>
  );
}
