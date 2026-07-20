import { QuerySyntaxError } from "./QuerySyntaxError";
import { tokenizeQuery } from "./tokenizer";
import { structurizeQuery } from "./parser";

/**
 * クエリ文字列をトークナイズ・構造化する.
 * トークナイズ (未終了の引用符 `:"` など) と構造化のどちらも QuerySyntaxError を
 * 投げうるが, どちらも try で受けて syntaxError として返す. これを怠ると例外が
 * parsedAdvancedQueryAtom → advancedMatcherAtom → filterMapsAtom → レンダーへ
 * 伝播してアプリごと落ちる. tokenize 失敗時はトークンが無いので空配列で返す.
 */
export const parseQuery = (query: string) => {
  let originalTokens: ReturnType<typeof tokenizeQuery> = [];
  try {
    const tokens = tokenizeQuery(query);
    originalTokens = [...tokens];
    const structure = structurizeQuery(tokens);
    return {
      tokens: originalTokens,
      structure,
    };
  } catch (error) {
    if (error instanceof QuerySyntaxError) {
      return {
        tokens: originalTokens,
        syntaxError: error,
      };
    }
    throw error;
  }
};
