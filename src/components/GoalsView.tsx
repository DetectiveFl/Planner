import { GitBranch, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePlannerStore } from "../store/plannerStore";
import "./GoalsView.css";

export function GoalsView() {
  const goals = usePlannerStore((s) => s.goals);
  const graphNodes = usePlannerStore((s) => s.graphNodes);
  const addGoal = usePlannerStore((s) => s.addGoal);
  const updateGoal = usePlannerStore((s) => s.updateGoal);
  const removeGoal = usePlannerStore((s) => s.removeGoal);
  const openGoalGraph = usePlannerStore((s) => s.openGoalGraph);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEditId(null);
  };

  const submit = () => {
    if (!title.trim()) return;
    if (editId) {
      updateGoal(editId, {
        title: title.trim(),
        description: description.trim(),
      });
    } else {
      addGoal(title.trim(), description.trim());
    }
    resetForm();
  };

  const startEdit = (id: string) => {
    const g = goals.find((x) => x.id === id);
    if (!g) return;
    setEditId(id);
    setTitle(g.title);
    setDescription(g.description);
  };

  const hasPath = (goalId: string) =>
    graphNodes.some((n) => n.goalId === goalId);

  return (
    <div className="goals-view">
      <header className="goals-header">
        <div>
          <h1>Цели</h1>
          <p>
            У каждой цели свой граф на вкладке «Путь» — откройте или создайте его
            кнопкой рядом с целью.
          </p>
        </div>
      </header>

      <div className="goals-compose">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название цели"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание (необязательно)"
          rows={2}
        />
        <div className="goals-compose-actions">
          {editId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Отмена
            </button>
          )}
          <button type="button" className="btn-primary" onClick={submit}>
            <Plus size={18} />
            {editId ? "Сохранить" : "Добавить цель"}
          </button>
        </div>
      </div>

      <ul className="goals-list scroll-y">
        {goals.length === 0 && (
          <li className="goals-empty">Пока нет целей — добавьте первую выше</li>
        )}
        {goals.map((g) => (
          <li key={g.id} className="goal-card">
            <div>
              <h3>{g.title}</h3>
              {g.description && <p>{g.description}</p>}
            </div>
            <div className="goal-card-actions">
              <button
                type="button"
                className="goal-path-btn"
                onClick={() => openGoalGraph(g.id)}
              >
                <GitBranch size={16} />
                {hasPath(g.id) ? "Открыть путь" : "Создать путь"}
              </button>
              <button
                type="button"
                className="btn-icon"
                aria-label="Изменить"
                onClick={() => startEdit(g.id)}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="btn-icon danger"
                aria-label="Удалить"
                onClick={() => removeGoal(g.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
