import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import "./GoalGraphNode.css";

type GoalNodeData = {
  label: string;
  onLabelChange: (label: string) => void;
  onDelete: () => void;
};

function GoalGraphNodeComponent({ data }: NodeProps) {
  const d = data as GoalNodeData;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.label);

  const commit = () => {
    d.onLabelChange(draft.trim() || "Без названия");
    setEditing(false);
  };

  return (
    <div className="goal-graph-node">
      <Handle type="target" position={Position.Top} className="goal-handle" />
      {editing ? (
        <input
          className="goal-node-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="goal-node-label"
          onDoubleClick={() => {
            setDraft(d.label);
            setEditing(true);
          }}
        >
          {d.label}
        </button>
      )}
      <button
        type="button"
        className="goal-node-delete"
        aria-label="Удалить узел"
        onClick={d.onDelete}
      >
        ×
      </button>
      <Handle type="source" position={Position.Bottom} className="goal-handle" />
    </div>
  );
}

export const GoalGraphNode = memo(GoalGraphNodeComponent);
