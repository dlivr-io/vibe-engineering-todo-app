import { render, screen, fireEvent, act } from "@testing-library/react";
import Toast from "@/components/Toast";

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders the message text", () => {
    render(<Toast message="Todos exported successfully" type="success" onDismiss={jest.fn()} />);
    expect(screen.getByText("Todos exported successfully")).toBeInTheDocument();
  });

  it("renders the dismiss button", () => {
    render(<Toast message="Some message" type="success" onDismiss={jest.fn()} />);
    expect(screen.getByRole("button", { name: /dismiss notification/i })).toBeInTheDocument();
  });

  it("applies green background class for success type", () => {
    render(<Toast message="Success!" type="success" onDismiss={jest.fn()} />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-green-600");
    expect(alert.className).not.toContain("bg-red-600");
  });

  it("applies red background class for error type", () => {
    render(<Toast message="Error!" type="error" onDismiss={jest.fn()} />);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-red-600");
    expect(alert.className).not.toContain("bg-green-600");
  });

  it("calls onDismiss after 3000ms via auto-dismiss timer", () => {
    const onDismiss = jest.fn();
    render(<Toast message="Auto dismiss" type="success" onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss before 3000ms have elapsed", () => {
    const onDismiss = jest.fn();
    render(<Toast message="Not yet" type="success" onDismiss={onDismiss} />);
    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("calls onDismiss immediately when dismiss button is clicked", () => {
    const onDismiss = jest.fn();
    render(<Toast message="Click dismiss" type="error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss notification/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("has role=alert for accessibility", () => {
    render(<Toast message="Accessible" type="success" onDismiss={jest.fn()} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});