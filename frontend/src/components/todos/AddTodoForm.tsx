"use client";
import { useState, FormEvent } from "react";

interface Props {
  onCreate: (title: string, description?: string) => Promise<void>;
}

export default function AddTodoForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Adding…" : "Add Todo"}
      </button>
    </form>
  );
}