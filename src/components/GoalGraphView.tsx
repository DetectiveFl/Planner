import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlannerStore } from "../store/plannerStore";
import { GoalGraphNode } from "./GoalGraphNode";
import "./GoalGraphView.css";

const nodeTypes = { goalNode: GoalGraphNode };

function GraphInner() {
  const goals = usePlannerStore((s) => s.goals);
  const graphNodes = usePlannerStore((s) => s.graphNodes);
  const graphEdges = usePlannerStore((s) => s.graphEdges);
  const activeGraphGoalId = usePlannerStore((s) => s.activeGraphGoalId);
  const openGoalGraph = usePlannerStore((s) => s.openGoalGraph);
  const addGraphNode = usePlannerStore((s) => s.addGraphNode);
  const removeGraphNode = usePlannerStore((s) => s.removeGraphNode);
  const addGraphEdge = usePlannerStore((s) => s.addGraphEdge);
  const removeGraphEdge = usePlannerStore((s) => s.removeGraphEdge);
  const updateGraphNode = usePlannerStore((s) => s.updateGraphNode);
  const setGraphLayoutForGoal = usePlannerStore((s) => s.setGraphLayoutForGoal);
  const clearGraphEdgesForGoal = usePlannerStore(
    (s) => s.clearGraphEdgesForGoal,
  );

  const activeGoal = goals.find((g) => g.id === activeGraphGoalId);

  const goalNodes = useMemo(
    () =>
      activeGraphGoalId
        ? graphNodes.filter((n) => n.goalId === activeGraphGoalId)
        : [],
    [graphNodes, activeGraphGoalId],
  );

  const goalEdges = useMemo(
    () =>
      activeGraphGoalId
        ? graphEdges.filter((e) => e.goalId === activeGraphGoalId)
        : [],
    [graphEdges, activeGraphGoalId],
  );

  const flowNodes: Node[] = useMemo(
    () =>
      goalNodes.map((n) => ({
        id: n.id,
        type: "goalNode",
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          onLabelChange: (label: string) => updateGraphNode(n.id, { label }),
          onDelete: () => removeGraphNode(n.id),
        },
      })),
    [goalNodes, updateGraphNode, removeGraphNode],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      goalEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#00e116", strokeWidth: 2 },
      })),
    [goalEdges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const onConnect = useCallback(
    (conn: Connection) => {
      if (conn.source && conn.target) {
        addGraphEdge(conn.source, conn.target);
      }
    },
    [addGraphEdge],
  );

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      if (!activeGraphGoalId) return;
      const updated = goalNodes.map((n) =>
        n.id === node.id
          ? { ...n, x: node.position.x, y: node.position.y }
          : n,
      );
      setGraphLayoutForGoal(activeGraphGoalId, updated);
    },
    [activeGraphGoalId, goalNodes, setGraphLayoutForGoal],
  );

  const addNode = () => {
    if (!activeGraphGoalId) return;
    const label = newLabel.trim() || "Новый шаг";
    addGraphNode(label, activeGraphGoalId);
    setNewLabel("");
  };

  if (goals.length === 0) {
    return (
      <div className="graph-view graph-view-empty">
        <h1>Путь к цели</h1>
        <p>Сначала добавьте цель на вкладке «Цели».</p>
      </div>
    );
  }

  return (
    <div className="graph-view">
      <header className="graph-header">
        <div>
          <h1>Путь к цели</h1>
          <p>
            {activeGoal
              ? `Граф: ${activeGoal.title}`
              : "Выберите цель — у каждой свой граф"}
          </p>
        </div>
      </header>

      <div className="graph-goal-tabs scroll-y">
        {goals.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`graph-goal-tab ${activeGraphGoalId === g.id ? "active" : ""}`}
            onClick={() => openGoalGraph(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      {!activeGraphGoalId ? (
        <div className="graph-pick-hint">
          Нажмите на цель выше или «Создать путь» в списке целей.
        </div>
      ) : (
        <>
          <div className="graph-toolbar">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Новая точка"
              onKeyDown={(e) => e.key === "Enter" && addNode()}
            />
            <button type="button" className="btn-primary" onClick={addNode}>
              <Plus size={18} />
              Точка
            </button>
          </div>

          <div className="graph-canvas">
            <ReactFlow
              key={activeGraphGoalId}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
              deleteKeyCode={["Delete", "Backspace"]}
              onEdgesDelete={(deleted) => {
                deleted.forEach((e) => removeGraphEdge(e.id));
              }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#3d3d3d"
              />
              <Controls showInteractive={false} />
              <MiniMap
                nodeColor={() => "#00e116"}
                maskColor="rgba(33,33,33,0.85)"
                style={{ background: "#1a1a1a" }}
              />
            </ReactFlow>
          </div>

          <footer className="graph-hint">
            Соединяйте узлы перетаскиванием от кружка. Delete — удалить связь.
            <button
              type="button"
              className="btn-ghost graph-clear-edges"
              onClick={() => clearGraphEdgesForGoal(activeGraphGoalId)}
            >
              <Trash2 size={14} />
              Очистить связи
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

export function GoalGraphView() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  );
}
