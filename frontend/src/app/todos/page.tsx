"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTodos } from "@/hooks/useTodos";
import AddTodoForm from "@/components/todos/AddTodoForm";
import TodoItem from "@/components/todos/TodoItem";
import Toast from "@/components/Toast";

export default function TodosPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { todos, loading: todosLoading, createTodo, updateTodo, deleteTodo, exportTodosCSV, exportLoading } = useTodos();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || todosLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  const handleExport = async () => {
    try {
      await exportTodosCSV();
      setToast({ message: "Todos exported successfully", type: "success" });
    } catch {
      setToast({ message: "Export failed. Please try again.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">My Todos</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {exportLoading ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <AddTodoForm onCreate={createTodo} />

        {pending.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Pending ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onDelete={deleteTodo} />
              ))}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Completed ({done.length})
            </h2>
            <div className="space-y-2">
              {done.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onDelete={deleteTodo} />
              ))}
            </div>
          </section>
        )}

        {todos.length === 0 && (
          <p className="text-center text-gray-400 py-12">No todos yet. Add one above!</p>
        )}
      </main>

      {toast !== null && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}