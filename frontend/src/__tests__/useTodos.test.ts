/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTodos } from "@/hooks/useTodos";
import api from "@/lib/api";

// Mock the api module so no real HTTP requests are made
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGet = api.get as jest.MockedFunction<typeof api.get>;
const mockPost = api.post as jest.MockedFunction<typeof api.post>;
const mockPatch = api.patch as jest.MockedFunction<typeof api.patch>;
const mockDelete = api.delete as jest.MockedFunction<typeof api.delete>;

const todoFixture = { id: 1, title: "Buy milk", description: null, completed: false, user_id: 1 };

describe("useTodos — exportTodosCSV", () => {
  let createObjectURLMock: jest.Mock;
  let revokeObjectURLMock: jest.Mock;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let anchorClickMock: jest.Mock;
  let fakeAnchor: HTMLAnchorElement;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock URL blob methods
    createObjectURLMock = jest.fn().mockReturnValue("blob:http://localhost/fake-url");
    revokeObjectURLMock = jest.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Build a real anchor element but replace its click with a mock.
    // Capture a reference so tests can inspect it later.
    anchorClickMock = jest.fn();
    // Use the real createElement before spying to avoid recursion
    const realCreateElement = document.createElement.bind(document);
    fakeAnchor = Object.assign(realCreateElement("a"), { click: anchorClickMock });

    jest.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "a") return fakeAnchor;
      return realCreateElement(tagName);
    });

    appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation((node) => node as Node);
    removeChildSpy = jest.spyOn(document.body, "removeChild").mockImplementation((node) => node as Node);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls api.get with responseType blob for the CSV endpoint", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: new Blob(["header\n"]) } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportTodosCSV();
    });

    expect(mockGet).toHaveBeenCalledWith("/todos/export/csv", { responseType: "blob" });
  });

  it("starts with exportLoading=false and returns it to false after successful export", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: new Blob(["header\n"]) } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.exportLoading).toBe(false);

    await act(async () => {
      await result.current.exportTodosCSV();
    });

    expect(result.current.exportLoading).toBe(false);
  });

  it("creates a blob URL from the response data", async () => {
    const csvBlob = new Blob(["id,title\n1,Test\n"], { type: "text/csv" });
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: csvBlob } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportTodosCSV();
    });

    expect(createObjectURLMock).toHaveBeenCalledWith(csvBlob);
  });

  it("triggers the anchor click to initiate browser download", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: new Blob(["header\n"]) } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportTodosCSV();
    });

    expect(anchorClickMock).toHaveBeenCalledTimes(1);
  });

  it("revokes the blob URL after the download is triggered", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: new Blob(["header\n"]) } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportTodosCSV();
    });

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/fake-url");
  });

  it("appends the hidden anchor to document.body and then removes it", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: new Blob(["header\n"]) } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Reset spy call history so we only count calls from exportTodosCSV,
    // not the DOM append performed by renderHook when mounting the component.
    appendChildSpy.mockClear();
    removeChildSpy.mockClear();

    await act(async () => {
      await result.current.exportTodosCSV();
    });

    // Verify the anchor element itself was appended and then removed
    expect(appendChildSpy).toHaveBeenCalledWith(fakeAnchor);
    expect(removeChildSpy).toHaveBeenCalledWith(fakeAnchor);
  });

  it("resets exportLoading to false even when the API call throws", async () => {
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockRejectedValueOnce(new Error("Network error") as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportTodosCSV().catch(() => undefined);
    });

    expect(result.current.exportLoading).toBe(false);
  });

  it("propagates the API error to the caller", async () => {
    const networkError = new Error("Network error");
    mockGet
      .mockResolvedValueOnce({ data: [] } as never)
      .mockRejectedValueOnce(networkError as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.exportTodosCSV();
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBe(networkError);
  });
});

describe("useTodos — initial load", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts with loading=true and transitions to false after fetch completes", async () => {
    mockGet.mockResolvedValueOnce({ data: [todoFixture] } as never);

    const { result } = renderHook(() => useTodos());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toEqual([todoFixture]);
  });

  it("starts with exportLoading=false before any export is triggered", async () => {
    mockGet.mockResolvedValueOnce({ data: [] } as never);
    const { result } = renderHook(() => useTodos());
    expect(result.current.exportLoading).toBe(false);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe("useTodos — createTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("appends the new todo returned by the API to the list", async () => {
    mockGet.mockResolvedValueOnce({ data: [] } as never);
    mockPost.mockResolvedValueOnce({ data: todoFixture } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTodo("Buy milk");
    });

    expect(result.current.todos).toEqual([todoFixture]);
    expect(mockPost).toHaveBeenCalledWith("/todos/", { title: "Buy milk", description: undefined });
  });
});

describe("useTodos — updateTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("replaces the updated todo in the list", async () => {
    mockGet.mockResolvedValueOnce({ data: [todoFixture] } as never);
    const updatedTodo = { ...todoFixture, completed: true };
    mockPatch.mockResolvedValueOnce({ data: updatedTodo } as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTodo(1, { completed: true });
    });

    expect(result.current.todos[0].completed).toBe(true);
  });
});

describe("useTodos — deleteTodo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removes the deleted todo from the list", async () => {
    mockGet.mockResolvedValueOnce({ data: [todoFixture] } as never);
    mockDelete.mockResolvedValueOnce({} as never);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTodo(1);
    });

    expect(result.current.todos).toEqual([]);
  });
});