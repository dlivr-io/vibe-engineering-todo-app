"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Todo } from "@/types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    const r = await api.get<Todo[]>("/todos/");
    setTodos(r.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTodos();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createTodo = async (title: string, description?: string) => {
    const r = await api.post<Todo>("/todos/", { title, description });
    setTodos((prev) => [...prev, r.data]);
  };

  const updateTodo = async (id: number, data: Partial<Pick<Todo, "title" | "description" | "completed">>) => {
    const r = await api.patch<Todo>(`/todos/${id}`, data);
    setTodos((prev) => prev.map((t) => (t.id === id ? r.data : t)));
  };

  const deleteTodo = async (id: number) => {
    await api.delete(`/todos/${id}`);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, loading, createTodo, updateTodo, deleteTodo };
}