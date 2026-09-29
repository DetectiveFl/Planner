import { DayPanel } from "./components/DayPanel";
import { GoalGraphView } from "./components/GoalGraphView";
import { GoalsView } from "./components/GoalsView";
import { MonthCalendar } from "./components/MonthCalendar";
import { Sidebar } from "./components/Sidebar";
import { usePlannerStore } from "./store/plannerStore";

export default function App() {
  const activeTab = usePlannerStore((s) => s.activeTab);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        {activeTab === "calendar" && <MonthCalendar />}
        {activeTab === "goals" && <GoalsView />}
        {activeTab === "graph" && <GoalGraphView />}
        <DayPanel />
      </main>
    </div>
  );
}
