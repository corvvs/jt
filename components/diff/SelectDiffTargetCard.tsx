import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaRegClock, FaRegFrown } from "react-icons/fa";
import { GoDiff } from "react-icons/go";
import { JsonDocumentPreview, JsonDocumentStore } from "@/data/document";
import { formatDateTime } from "@/libs/format";
import { diffPath, parseDocRoute } from "@/libs/routes";

/**
 * diff の比較相手 (旧側) を保存済みドキュメントから選ぶカード
 */
export function SelectDiffTargetCard(props: {
  closeModal: VoidFunction;
}) {
  const router = useRouter();
  const { docId } = parseDocRoute(router.query);
  const [previews, setPreviews] = useState<JsonDocumentPreview[] | null>(null);

  useEffect(() => {
    JsonDocumentStore.listPreviews({ skip: 0, limit: 100 })
      .then((result) => setPreviews(result ? result.data : []))
      .catch((e) => {
        console.error(e);
        setPreviews([]);
      });
  }, []);

  const candidates = (previews ?? [])
    .filter((doc) => doc.id !== docId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div
      className='json-text w-[36em] flex flex-col text-sm border-2 rounded-lg'
    >
      <div
        className="shrink-0 grow-0 flex flex-col gap-1 p-2"
      >
        <h3 className="flex flex-row items-center gap-2 text-md font-medium">
          <GoDiff />
          <span>比較するドキュメントを選択</span>
        </h3>
        <p className="text-xs secondary-foreground">
          選択したドキュメント (旧) と表示中のドキュメント (新) を比較します
        </p>
      </div>

      <div
        className="shrink grow max-h-[24em] overflow-y-auto p-2 flex flex-col gap-2"
      >
        {
          previews === null
            ? <p className="p-2">Loading...</p>
            : candidates.length === 0
              ? <div className="flex flex-col items-center p-4 gap-2">
                  <FaRegFrown className="text-2xl" />
                  <p>比較できる保存済みドキュメントがありません</p>
                </div>
              : candidates.map((doc) => (
                <div
                  key={doc.id}
                  className="document-list-item"
                  onClick={() => {
                    if (!docId) { return; }
                    props.closeModal();
                    router.push(diffPath(docId, doc.id));
                  }}
                >
                  <h4 className="font-medium truncate">
                    {doc.name || '無題のドキュメント'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaRegClock />
                      <span className="font-mono">{formatDateTime(doc.updated_at)}</span>
                    </span>
                    <span className="font-mono">ID: {doc.id.substring(0, 8)}...</span>
                  </div>
                </div>
              ))
        }
      </div>
    </div>
  );
}
