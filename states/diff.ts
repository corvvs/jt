import { atom, useAtom } from 'jotai';
import type { ParsedJSONData } from './json';

export type DiffTarget = {
  docId: string;
  name: string;
  parsed: ParsedJSONData;
};

/**
 * diff モードの比較相手 (旧側). null なら通常モード.
 * 新側は常に表示中のドキュメント (states/json.ts の parsedJson).
 */
export const diffTargetAtom = atom<DiffTarget | null>(null);

export function useDiffTarget() {
  const [diffTarget, setDiffTarget] = useAtom(diffTargetAtom);
  return {
    diffTarget,
    setDiffTarget,
  } as const;
}
