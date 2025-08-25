import { FilteringResultAppearanceOption, QueryMode } from './manipulation/query';

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

export function saveDefaultSearchAppearance(item: FilteringResultAppearanceOption) {
  localStorage.setItem("defaultSearchResultAppearance", item);
}

export function loadDefaultSearchAppearance(): FilteringResultAppearanceOption | null {
  if (typeof window === 'undefined') { return null; }
  const mode = localStorage.getItem("defaultSearchResultAppearance");
  if (mode) {
    return mode as FilteringResultAppearanceOption;
  }
  return null;
}
