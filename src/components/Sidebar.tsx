import { Calendar, GitBranch, Target } from "lucide-react";
import type { AppTab } from "../types";
import { usePlannerStore } from "../store/plannerStore";
import "./Sidebar.css";

const items: { id: AppTab; icon: typeof Calendar; label: string }[] = [
  { id: "calendar", icon: Calendar, label: "Календарь" },
  { id: "goals", icon: Target, label: "Цели" },
  { id: "graph", icon: GitBranch, label: "Путь" },
];

export function Sidebar() {
  const activeTab = usePlannerStore((s) => s.activeTab);
  const setActiveTab = usePlannerStore((s) => s.setActiveTab);
  const closeDay = usePlannerStore((s) => s.closeDay);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">P</div>
      <nav className="sidebar-nav">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-item ${activeTab === id ? "active" : ""}`}
            title={label}
            aria-label={label}
            onClick={() => {
              setActiveTab(id);
              closeDay();
            }}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
