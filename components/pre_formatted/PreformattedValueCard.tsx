// 整形された (Preformatted) 文字列値を表示するカードコンポーネント
// 文字列中の改行・タブ・スペースを忠実に表示する。
// また表示には等幅フォントを用いる。

import { VscCopy, VscCloudDownload } from "react-icons/vsc";
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { ClipboardAccess, FileDownload } from "@/libs/sideeffect";
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
        <div>
          <JetButton
            onClick={() => {
              try {
                // 値がJSONの場合はJSONとして、そうでなければテキストとして保存
                let data;
                let filename;
                try {
                  data = JSON.parse(props.value);
                  filename = 'value.json';
                } catch {
                  data = props.value;
                  filename = 'value.txt';
                }
                
                if (typeof data === 'string') {
                  // テキストファイルとしてダウンロード
                  const blob = new Blob([data], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                } else {
                  // JSONファイルとしてダウンロード
                  FileDownload.downloadAsJson(data, filename);
                }
                
                toast("値をファイルとしてダウンロードしました");
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <InlineIcon i={<VscCloudDownload />} />
            Download
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