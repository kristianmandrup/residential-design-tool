import React from "react";
import { useEditor } from "@/contexts/EditorContext";
import { useRoadDrawing } from "@/contexts/RoadDrawingContext";

import { useDebugMigration } from "@/utils/debugMigration";

export function DebugPanel() {
  const { analyzeStore, fixAllIssues } = useDebugMigration();

  return (
    <div>
      <button
        onClick={() => {
          const report = analyzeStore();
          console.log("Store Analysis:", report);
        }}
      >
        🔍 Analyze Store
      </button>

      <button
        onClick={() => {
          const results = fixAllIssues();
          console.log("Fix Results:", results);
        }}
      >
        🔧 Fix All Issues
      </button>
    </div>
  );
}

export function DebugRoadStore() {
  const { objects, selectedId } = useEditor();
  const roadDrawing = useRoadDrawing();

  // Filter only road objects
  const roads = objects.filter((obj) => obj.type === "road");

  const [showDebug, setShowDebug] = React.useState(false);

  if (!showDebug) {
    return (
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "12px",
          cursor: "pointer",
        }}
        onClick={() => setShowDebug(true)}
      >
        🛣️ Debug ({roads.length} roads)
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        maxWidth: "400px",
        maxHeight: "80vh",
        overflow: "auto",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid #444",
          paddingBottom: "5px",
        }}
      >
        <strong>🛣️ Road Debug Store</strong>
        <button
          onClick={() => setShowDebug(false)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Current drawing state */}
      <div
        style={{
          marginBottom: "15px",
          padding: "8px",
          background: "rgba(255,255,0,0.1)",
          borderRadius: "4px",
        }}
      >
        <div>
          <strong>🎨 Drawing State:</strong>
        </div>
        <div>Drawing: {roadDrawing.isDrawingRoad ? "✅" : "❌"}</div>
        <div>Points: {roadDrawing.tempRoadPoints.length}</div>
        <div>Type: {roadDrawing.selectedRoadType}</div>
        <div>Width: {roadDrawing.roadWidth}</div>
        {roadDrawing.tempRoadPoints.length > 0 && (
          <div style={{ marginTop: "5px", fontSize: "10px" }}>
            <div>Temp Points:</div>
            {roadDrawing.tempRoadPoints.map((p, i) => (
              <div key={i} style={{ marginLeft: "10px" }}>
                {i}: ({p.x.toFixed(2)}, {p.z.toFixed(2)})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store summary */}
      <div
        style={{
          marginBottom: "15px",
          padding: "8px",
          background: "rgba(0,255,0,0.1)",
          borderRadius: "4px",
        }}
      >
        <div>
          <strong>📦 Store Summary:</strong>
        </div>
        <div>Total Objects: {objects.length}</div>
        <div>Roads: {roads.length}</div>
        <div>Selected: {selectedId || "none"}</div>
      </div>

      {/* Road objects */}
      <div>
        <div style={{ marginBottom: "10px" }}>
          <strong>🛣️ Roads in Store:</strong>
        </div>
        {roads.length === 0 ? (
          <div style={{ color: "#888", fontStyle: "italic" }}>
            No roads found
          </div>
        ) : (
          roads.map((road, index) => (
            <div
              key={road.id}
              style={{
                marginBottom: "10px",
                padding: "8px",
                background:
                  selectedId === road.id
                    ? "rgba(0,255,0,0.2)"
                    : "rgba(255,255,255,0.1)",
                borderRadius: "4px",
                border:
                  selectedId === road.id ? "1px solid #0f0" : "1px solid #444",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                #{index + 1} {road.name || road.id}
                {selectedId === road.id && " 👈 SELECTED"}
              </div>
              <div>ID: {road.id}</div>
              <div>Type: {road.roadType || "unknown"}</div>
              <div>Width: {road.width || "unknown"}</div>
              <div>Points: {road.points?.length || 0}</div>
              {road.elevation !== undefined && (
                <div>Elevation: {road.elevation}</div>
              )}
              {road.thickness !== undefined && (
                <div>Thickness: {road.thickness}</div>
              )}
              {road.color && <div>Color: {road.color}</div>}

              {road.points && road.points.length > 0 && (
                <details style={{ marginTop: "5px" }}>
                  <summary style={{ cursor: "pointer", fontSize: "10px" }}>
                    Points ({road.points.length})
                  </summary>
                  <div
                    style={{
                      marginLeft: "10px",
                      fontSize: "10px",
                      marginTop: "5px",
                    }}
                  >
                    {road.points.map((point, i) => (
                      <div key={i}>
                        {i}: ({point.x?.toFixed(2) || "?"},{" "}
                        {point.z?.toFixed(2) || "?"})
                        {point.controlPoint &&
                          ` [ctrl: (${point.controlPoint.x.toFixed(
                            2
                          )}, ${point.controlPoint.z.toFixed(2)})]`}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: "15px",
          paddingTop: "10px",
          borderTop: "1px solid #444",
          fontSize: "10px",
          color: "#ccc",
        }}
      >
        <div>
          <strong>💡 Instructions:</strong>
        </div>
        <div>• Click points to draw road</div>
        <div>• Double-click or Enter to finish</div>
        <div>• Escape to cancel</div>
        <div>• Ctrl+U to undo last point</div>
      </div>
    </div>
  );
}
