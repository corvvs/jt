import { QueryMode } from './manipulation/query';

export function saveDefaultSearchMode(item: QueryMode) {
  localStorage.setItem("defaultSearchMode", item);
}

export function loadDefaultSearchMode(): QueryMode | null {
  if (typeof window === 'undefined') { return null; }
  const mode = localStorage.getItem("defaultSearchMode");
  if (mode) {
    return mode as QueryMode;
  }
  return null;
}
