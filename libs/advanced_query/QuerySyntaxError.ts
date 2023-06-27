import { CompoundQuery, GenericQuery, TokenToQuery } from "./types";

export class QuerySyntaxError implements Error {
  public name = "QuerySyntaxError"; 

  constructor(
    public subname: string,
    public message: string,
    public payload: {
      compound?: CompoundQuery;
      rest?: GenericQuery[];
      starter?: TokenToQuery;
      ender?: TokenToQuery;
      opens?: CompoundQuery[],
      stack?: GenericQuery[]
    } = {}
  ) {
  }

  public toString() {
    return [this.name, this.subname, this.message].join(": ");
  }
}
