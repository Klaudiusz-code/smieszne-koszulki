import { CommerceError, commerceError } from "./errors";

export interface ResourceState<T> {
  data: T | null;
  status: "idle" | "loading" | "ready" | "error";
  action: string | null;
  error: CommerceError | null;
}

/** A gate can be shared by resources that mutate the same backend session. */
export function createWriteGate() {
  let locked = false;
  return {
    acquire() {
      if (locked) throw new CommerceError("busy", "Another session mutation is in progress");
      locked = true;
      return () => { locked = false; };
    },
  };
}

/** Instance-local state. Never put a private resource in a server module singleton. */
export function createResource<T>(read: () => Promise<T>, gate = createWriteGate(), initialData: T | null = null) {
  const initial: ResourceState<T> = { data: initialData, status: initialData === null ? "idle" : "ready", action: null, error: null };
  let state = initial;
  let generation = 0;
  let pendingRead: Promise<T> | null = null;
  let pendingWrite: Promise<T> | null = null;
  const listeners = new Set<() => void>();
  const publish = (next: ResourceState<T>) => { state = next; listeners.forEach((listener) => listener()); };

  function refresh(): Promise<T> {
    if (pendingWrite) return pendingWrite;
    if (pendingRead) return pendingRead;
    const version = generation;
    publish({ ...state, status: "loading", error: null });
    const request = Promise.resolve().then(read).then((data) => {
      if (version === generation) publish({ data, status: "ready", action: null, error: null });
      return data;
    }).catch((cause) => {
      if (version === generation) publish({ ...state, status: "error", error: commerceError(cause) });
      throw cause;
    }).finally(() => { if (pendingRead === request) pendingRead = null; });
    pendingRead = request;
    return request;
  }

  function mutate(action: string, write: () => Promise<unknown>, { refreshOnWriteError = false } = {}): Promise<T> {
    if (pendingWrite) return Promise.reject(new CommerceError("busy", "Mutation already in progress"));
    if (state.status === "error") return Promise.reject(new CommerceError("stale", "Refresh before another mutation"));
    let release: () => void;
    try { release = gate.acquire(); } catch (cause) { return Promise.reject(cause); }
    const version = ++generation;
    pendingRead = null; // Earlier reads may finish but cannot replace this mutation's result.
    publish({ ...state, action, error: null });
    let reconciled = false;
    const request = Promise.resolve().then(write).catch(async (cause) => {
      if (refreshOnWriteError) {
        // Keep the write gate until prices are verified. Never retry the mutation.
        const data = await read();
        if (version === generation) publish({ data, status: "ready", action: null, error: null });
        reconciled = true;
      }
      throw cause;
    }).then(read).then((data) => {
      if (version === generation) publish({ data, status: "ready", action: null, error: null });
      return data;
    }).catch((cause) => {
      if (!reconciled && version === generation) publish({ ...state, status: "error", action: null, error: commerceError(cause) });
      throw cause;
    }).finally(() => {
      release();
      if (pendingWrite === request) pendingWrite = null;
      if (version !== generation && state.status === "idle" && listeners.size) void refresh().catch(() => {});
    });
    pendingWrite = request;
    return request;
  }

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    ensure() { return state.status === "idle" ? refresh() : pendingRead ?? Promise.resolve(state.data); },
    refresh,
    mutate,
    accept(data: T) {
      if (pendingWrite) return;
      generation++;
      pendingRead = null;
      publish({ data, status: "ready", action: null, error: null });
    },
    invalidate() {
      generation++;
      pendingRead = null;
      publish({ ...initial });
    },
  };
}
export type Resource<T> = ReturnType<typeof createResource<T>>;
