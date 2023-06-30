import { JsonViewer } from "@/components/JsonViewer";
import Layout from "@/components/Layout";
import { ToastHolder } from "@/components/toast/ToastHolder";
import { JsonText } from "@/data/text";
import { useJSON } from "@/states";
import { defaultRawText } from "@/states/json";
import { useEffect } from "react";
import { GoogleAnalytics } from '../components/gtag'

export default function Home() {

  const { setRawtext, setBaseText, parseJson, setParsedJson } = useJSON();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jsonText = JsonText.loadTextLocal() || defaultRawText;
      setRawtext(jsonText);
      setBaseText(jsonText);
      const json = parseJson(jsonText);
      if (typeof json !== "undefined") {
        setParsedJson({ json });
      }
    }
  }, []);

  return (
    <Layout>
      <GoogleAnalytics />
      <JsonViewer />
      <ToastHolder />
    </Layout>
  )
}
