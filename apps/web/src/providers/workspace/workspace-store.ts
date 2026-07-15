const WORKSPACE_ID_KEY = "finai_workspace_id";
const TOKEN_KEY = "finai_token";

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getWorkspaceIdSnapshot() {
  return localStorage.getItem(WORKSPACE_ID_KEY);
}

export function getTokenSnapshot() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getServerSnapshot() {
  return null;
}

export function writeWorkspaceId(id: string) {
  localStorage.setItem(WORKSPACE_ID_KEY, id);
  document.cookie = `${WORKSPACE_ID_KEY}=${id}; path=/; max-age=604800; SameSite=Lax`;
  emitChange();
}
