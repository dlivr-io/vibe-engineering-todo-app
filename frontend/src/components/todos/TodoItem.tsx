"use client";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Todo } from "@/types";

interface Props {
  todo: Todo;
  onUpdate: (id: number, data: Partial<Pick<Todo, "title" | "description" | "completed">>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TodoItem({ todo, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");

  const handleToggle = () => onUpdate(todo.id, { completed: !todo.completed });

  const handleSave = async () => {
    await onUpdate(todo.id, { title, description: description || undefined });
    setEditing(false);
  };

  return (
    <>
      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${todo.completed ? "line-through text-gray-400" : ""}`}>{todo.title}</p>
          {todo.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{todo.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">Edit</button>
          <button onClick={() => onDelete(todo.id)} className="text-sm text-red-500 hover:underline">Delete</button>
        </div>
      </div>

      <Dialog open={editing} onClose={() => setEditing(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-bold mb-4">Edit Todo</DialogTitle>
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Description (optional)"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}