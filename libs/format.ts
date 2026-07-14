/**
 * ドキュメントの作成・更新日時の表示書式 (ドキュメント一覧と diff 相手選択で共通)
 */
export function formatDateTime(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
