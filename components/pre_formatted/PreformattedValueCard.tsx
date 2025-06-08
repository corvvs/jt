// 整形された (Preformatted) 文字列値を表示するカードコンポーネント
// 文字列中の改行・タブ・スペースを忠実に表示する。
// また表示には等幅フォントを用いる。

import { VscCopy } from "react-icons/vsc";
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";

export function PreformattedValueCard(
  props: {
    value: string;
  }
) {
  return (
    <div
      className='json-text w-[48em] flex flex-col font-mono text-sm border-2 rounded-lg'
    >
      <div
        className="shrink-0 grow-0 flex flex-row gap-2 p-2 text-md"
      >
        <div>
          <JetButton
            onClick={async () => {
              try {
                await ClipboardAccess.copyText(props.value);
                toast("値をクリップボードにコピーしました");
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <InlineIcon i={<VscCopy />} />
            Copy
          </JetButton>
        </div>
      </div>

      <div
        className="shrink grow relative p-2"
      >
        <div
          className="w-full h-[36em] p-1 whitespace-pre overflow-scroll preformatted-value"
        >
          {props.value}
        </div>
      </div>
    </div>
  );
}