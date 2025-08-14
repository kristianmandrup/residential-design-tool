import { GenericIntersection } from "@/components/build-objects/shared/types";

interface IntersectionPanelProps {
  intersections: GenericIntersection[];
  onSelectIntersection?: (intersection: GenericIntersection) => void;
  onDeleteIntersection?: (intersection: GenericIntersection) => void;
}

export function IntersectionPanel({
  intersections,
  onSelectIntersection,
  onDeleteIntersection,
}: IntersectionPanelProps) {
  const getIntersectionIcon = (type: GenericIntersection["type"]) => {
    switch (type) {
      case "cross":
        return "✚";
      case "T-junction":
        return "⊥";
      case "Y-junction":
        return "⟨";
      case "L-corner":
        return "⌐";
      case "multi-way":
        return "✱";
      case "end":
        return "◉";
      default:
        return "○";
    }
  };

  const getObjectTypeIcon = (type: string) => {
    switch (type) {
      case "road":
        return "🛣️";
      case "wall":
        return "🧱";
      case "water":
        return "💧";
      default:
        return "⚫";
    }
  };

  if (intersections.length === 0) {
    return (
      <div className="intersection-panel">
        <div className="panel-header">
          <h3>🔄 Intersections</h3>
        </div>
        <div className="panel-content">
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No intersections detected</p>
            <small>Draw overlapping objects to create intersections</small>
          </div>
        </div>
      </div>
    );
  }

  // Group intersections by type
  const groupedIntersections = intersections.reduce((groups, intersection) => {
    const type = intersection.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(intersection);
    return groups;
  }, {} as Record<string, GenericIntersection[]>);

  return (
    <div className="intersection-panel">
      <div className="panel-header">
        <h3>🔄 Intersections ({intersections.length})</h3>
      </div>

      <div className="panel-content">
        {Object.entries(groupedIntersections).map(
          ([type, typeIntersections]) => (
            <div key={type} className="intersection-group">
              <div className="group-header">
                <span className="group-icon">
                  {getIntersectionIcon(type as GenericIntersection["type"])}
                </span>
                <span className="group-title">{type.replace("-", " ")}</span>
                <span className="group-count">
                  ({typeIntersections.length})
                </span>
              </div>

              {typeIntersections.map((intersection) => (
                <div
                  key={intersection.id}
                  className="intersection-item"
                  onClick={() => onSelectIntersection?.(intersection)}
                >
                  <div className="intersection-header">
                    <div className="intersection-info">
                      <span className="intersection-position">
                        ({intersection.position.x.toFixed(1)},{" "}
                        {intersection.position.z.toFixed(1)})
                      </span>
                      <span className="intersection-radius">
                        R: {intersection.radius.toFixed(2)}m
                      </span>
                    </div>

                    {onDeleteIntersection && (
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteIntersection(intersection);
                        }}
                      >
                        ❌
                      </button>
                    )}
                  </div>

                  <div className="intersection-details">
                    <div className="detail-row">
                      <span className="detail-label">Objects:</span>
                      <span className="detail-value">
                        {intersection.connectedObjects.length}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Elevation:</span>
                      <span className="detail-value">
                        {intersection.elevation.toFixed(3)}m
                      </span>
                    </div>
                  </div>

                  <div className="intersection-objects">
                    {intersection.objectTypes.map((objectType, index) => (
                      <span key={index} className={`object-tag ${objectType}`}>
                        <span className="object-icon">
                          {getObjectTypeIcon(objectType)}
                        </span>
                        <span className="object-name">{objectType}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
