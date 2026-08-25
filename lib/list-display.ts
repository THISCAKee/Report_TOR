const DEFAULT_VISIBLE_ITEM_LIMIT = 3;

export function getVisibleItems<T>(items: T[], expanded: boolean, limit = DEFAULT_VISIBLE_ITEM_LIMIT): T[] {
  return expanded ? items : items.slice(0, limit);
}
