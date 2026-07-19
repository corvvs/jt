import { QueryToken } from "./types";

export class QuerySyntaxError implements Error {
  public name = "QuerySyntaxError";

  constructor(
    public subname: string,
    public message: string,
    public payload: {
      /** エラーの原因となったトークン */
      token?: QueryToken;
      /** 位置: トークナイズエラーならクエリ文字列中の文字位置, パースエラーならトークン位置 */
      position?: number;
    } = {}
  ) {
  }

  public toString() {
    return [this.name, this.subname, this.message].join(": ");
  }
}
