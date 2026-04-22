import { render, screen, fireEvent } from "@testing-library/react";
import TodoItem from "@/components/todos/TodoItem";
import { Todo } from "@/types";

const todo: Todo = { id: 1, title: "Buy milk", description: null, completed: false, user_id: 1 };

describe("TodoItem", () => {
  it("renders title", () => {
    render(<TodoItem todo={todo} onUpdate={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("calls onDelete when delete clicked", () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(<TodoItem todo={todo} onUpdate={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("calls onUpdate when checkbox toggled", () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    render(<TodoItem todo={todo} onUpdate={onUpdate} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onUpdate).toHaveBeenCalledWith(1, { completed: true });
  });

  it("applies line-through when completed", () => {
    const done = { ...todo, completed: true };
    render(<TodoItem todo={done} onUpdate={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Buy milk")).toHaveClass("line-through");
  });
});