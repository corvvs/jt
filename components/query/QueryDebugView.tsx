import { useAdvancedQuery } from "@/libs/advanced_query"
import { QuerySyntaxError } from "@/libs/advanced_query/QuerySyntaxError";
import { GroupedQuery, Query, SegmentQuery } from "@/libs/advanced_query/types";
import { useEffectiveItems } from "@/states/json";


const SegmentView = (props: {
  segment: SegmentQuery;
}) => {
  const { segment } = props;
  return (<div className="flex flex-col border-2 p-2">
    {
      segment.kind === "descendants"
        ? <p className="text-green-600">**</p>
        : <p>&quot;{segment.pattern}&quot;</p>
    }
    {
      (segment.predicates ?? []).map((predicate, i) => <div key={i} className="flex flex-col">
        <h4 className="text-green-600">Predicate</h4>
        <QueryUnitView queryUnit={predicate.query} />
      </div>)
    }
  </div>);
};

const QueryUnitView = (props: {
  queryUnit: GroupedQuery | Query;
}) => {
  const qu = props.queryUnit;
  switch (qu.type) {
    case "GroupedQuery": return (<div
      className="border-2 p-2"
    >
      <h3 className="text-red-400 font-bold">{qu.type}</h3>
      <h4 className="text-green-600">{qu.op}</h4>
      <div
        className="flex flex-row items-center border-2 p-2 gap-2"
      >
        { qu.queries.map((u, i) => <QueryUnitView key={i} queryUnit={u} />) }
      </div>
    </div>);

    case "Query": return (<div
      className="border-2 p-2"
    >
      <h3 className="text-red-400 font-bold">{qu.type}</h3>

      {
        qu.keyPathQuery ? <>
          <h4 className="text-green-600">
            KeyPathQuery{qu.keyPathQuery.anchored ? " ($)" : ""}
          </h4>
          <div
            className="flex flex-row items-center border-2 p-2 gap-2"
          >
            {
              qu.keyPathQuery.segments.map((segment, i) => <SegmentView key={i} segment={segment} />)
            }
          </div>
        </> : null
      }

      {
        qu.valueQuery ? <>
          <h4 className="text-green-600">
            ValueQuery{qu.valueQuery.quoted ? " (quoted)" : ""}
          </h4>
          <div
            className="flex flex-row items-center border-2 p-2"
          >
            <p>&quot;{qu.valueQuery.token}&quot;</p>
          </div>
        </> : null
      }
    </div>);
  }
}

const SyntaxErrorContents = (props: {
  error: QuerySyntaxError;
}) => {
  const { error } = props;
  return <>
    <h2 className="text-red-400 font-bold">Syntax Error</h2>
    <div>
      <h3 className="text-red-400">{ error.subname }:</h3>
      <p>{ error.message }</p>
    </div>

    {
      error.payload.token
        ? <div>
            <h3 className="text-red-400 font-bold">Token</h3>
            <p>{error.payload.token.type}{error.payload.token.token ? `: "${error.payload.token.token}"` : ""}</p>
          </div>
        : null
    }

    {
      typeof error.payload.position === "number"
        ? <div>
            <h3 className="text-red-400 font-bold">Position</h3>
            <p>{error.payload.position}</p>
          </div>
        : null
    }
  </>
};

export const QueryDebugView = () => {
  const { parsedQuery, advancedMatcher } = useAdvancedQuery();
  const flatJsons = useEffectiveItems();
  if (!parsedQuery) { return null; }
  if (!flatJsons) { return null; }

  const queryContent = (() => {
    if (!parsedQuery.structure) { return null; }
    return <>
      <h2 className="font-bold">AST</h2>
      <div
        className="flex flex-row flex-wrap p-1 gap-1 items-center"
      >
        {
          parsedQuery.structure
            ? parsedQuery.structure.map((query, i) => {
                return <QueryUnitView
                  queryUnit={query}
                  key={i}
                />
              })
            : null
        }
      </div>
    </>
  })();

  const syntaxErrorContent = (() => {
    if (!parsedQuery.syntaxError) { return null; }
    return <SyntaxErrorContents error={parsedQuery.syntaxError} />;
  })();

  const filteredItems = advancedMatcher ? flatJsons.items.filter(advancedMatcher) : flatJsons.items;

  return (
    <div
      className="shrink grow flex flex-col overflow-scroll"
    >
      <h2 className="font-bold">Tokens</h2>
      <div
        className="flex flex-row flex-wrap p-1 gap-1 items-center"
      >
        {
          parsedQuery.tokens.map((token, i) => {
            return <div
              key={i}
              className="flex flex-row gap-1 items-center p-1 border-2"
            >
              <p className="text-red-400 font-bold">{token.type}</p>
              <p className="">{token.token}</p>
            </div>
          })
        }
      </div>

      { queryContent }
      { syntaxErrorContent }

      <h2 className="font-bold">Items</h2>

      <p>
        {
          filteredItems
            ? <><span>{flatJsons.items.length}items</span><span>→</span><span>{filteredItems.length}items</span></>
            : <span>None</span>

        }
      </p>

    </div>
  )
}
