import { JsonViewer } from "@/components/JsonViewer";
import Layout from "@/components/Layout";
import { JsonText } from "@/data/text";
import { useJSON } from "@/states";
import { defaultRawText } from "@/states/json";
import { useEffect } from "react";

export default function Home() {

  const { setRawtext, setBaseText, parseJson, setParsedJson } = useJSON();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jsonText = JsonText.loadTextLocal() || defaultRawText;
      console.log("jsonText", jsonText);
      setRawtext(jsonText);
      setBaseText(jsonText);
      const json = parseJson(jsonText);
      if (json) {
        setParsedJson(json);
      }
    }
  }, []);

  return (
    <Layout>
      <JsonViewer />
    </Layout>
  )
}
