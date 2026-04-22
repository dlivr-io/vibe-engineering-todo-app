import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTodoForm from "@/components/todos/AddTodoForm";

describe("AddTodoForm", () => {
  it("calls onCreate with title", async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined);
    render(<AddTodoForm onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText(/what needs to be done/i), { target: { value: "Test task" } });
    fireEvent.click(screen.getByRole("button", { name: /add todo/i }));
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith("Test task", undefined));
  });

  it("does not call onCreate with empty title", () => {
    const onCreate = jest.fn();
    render(<AddTodoForm onCreate={onCreate} />);
    fireEvent.click(screen.getByRole("button", { name: /add todo/i }));
    expect(onCreate).not.toHaveBeenCalled();
  });
});