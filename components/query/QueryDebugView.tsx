import { useAdvancedQuery } from "@/libs/advanced_query"
import { QuerySyntaxError } from "@/libs/advanced_query/QuerySyntaxError";
import { matchByQuery } from "@/libs/advanced_query/matcher";
import { GenericQuery, KeyStringQuery } from "@/libs/advanced_query/types";
import { useJSON } from "@/states";
import _ from "lodash";


const QueryUnitView = (props: {
  queryUnit: GenericQuery;
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
          <h4 className="text-green-600">KeyPathQuery</h4>
          <div
            className="flex flex-row items-center border-2 p-2"
          >
            <QueryUnitView queryUnit={qu.keyPathQuery} />
          </div>
        </> : null
      }

      {
        qu.valueQuery ? <>
          <h4 className="text-green-600">ValueQuery</h4>
          <div
            className="flex flex-row items-center border-2 p-2"
          >
            <QueryUnitView queryUnit={qu.valueQuery} />
          </div>
        </> : null
      }
    </div>);

  case "KeyPathQuery": return (<div
    className="border-2 p-2"
    >
    <h3 className="text-red-400 font-bold">{qu.type}</h3>

    <div
      className="flex flex-col items-start border-2 p-2 gap-2"
    >
      { 
        qu.tokens.map((u, i) => <div
          key={i}
          className="flex flex-col"
        >
          <h3 className="text-red-400 font-bold">{u.type}</h3>
          <p>position: { u.position }</p>
          {
            u.string
              ? <p>&quot;{u.string.token}&quot;</p>
              : null
          }
        </div>)
      }
    </div>
  </div>);


  case "ValueQuery": return (<div
    className="border-2 p-2"
    >
    <h3 className="text-red-400 font-bold">{qu.type}</h3>

    <div
      className="flex flex-row items-center border-2 p-2"
    >
      { 
        qu.tokens.map((u, i) => <div
          key={i}
          className="flex flex-col"
        >
          <h3 className="text-red-400 font-bold">{u.type}</h3>
          <p>&quot;{u.token}&quot;</p>
        </div>)
      }
    </div>
  </div>);


  default: return (<div
    className="border-2 p-2"
    >
    <h3 className="text-red-400 font-bold">{qu.type}</h3>
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
      error.payload.ender
        ? <>
            <h2 className="text-red-400 font-bold">Ender</h2>
            <div>
              {error.payload.ender.token}
            </div>
        </>
        : null
    }

    {
      error.payload.compound
        ? <>
            <h2 className="text-red-400 font-bold">Compound</h2>
            <QueryUnitView queryUnit={error.payload.compound!} />
        </>
        : null
    }

    {
      error.payload.rest
        ? <>
            <h2 className="text-red-400 font-bold">Rest</h2>
            <div
              className="flex flex-row flex-wrap p-1 gap-1 items-center"
            >
              {
                error.payload.rest!.map((query, i) => {
                    return <QueryUnitView
                      queryUnit={query}
                      key={i}
                    />
                })
              }
            </div>
          </>
        : null
    }

    {
      error.payload.opens
        ? <>
            <h2 className="text-red-400 font-bold">Opens</h2>
            <div
              className="flex flex-row flex-wrap p-1 gap-1 items-center"
            >
              {
                error.payload.opens!.map((query, i) => {
                    return <QueryUnitView
                      queryUnit={query}
                      key={i}
                    />
                })
              }
            </div>
          </>
        : null
    }

  </>
};

export const QueryDebugView = () => {
  const { parsedQuery, advancedMatcher } = useAdvancedQuery();
  const { flatJsons } = useJSON();
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
