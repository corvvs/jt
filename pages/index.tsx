import { Main } from "@/components/Main";
import Layout from "@/components/Layout";
import { ToastHolder } from "@/components/toast/ToastHolder";
import { JsonText } from "@/data/text";
import { useJSON } from "@/states";
import { defaultRawText } from "@/states/json";
import { useEffect } from "react";
import { GoogleAnalytics } from '../components/gtag'
import { EditJsonCardHolder } from "@/components/holders/modal/EditJsonCard";

export default function Home() {

  const { setRawtext, setBaseText, parseJson, setParsedJson } = useJSON();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jsonText = JsonText.loadTextLocal() || defaultRawText;
      setRawtext(jsonText);
      setBaseText(jsonText);
      try {
        const json = parseJson(jsonText);
        setParsedJson({ status: "accepted", json });
      } catch (e) {
        setParsedJson({ status: "rejected", error: e });
      }
    }
  }, []);

  return (
    <Layout>
      <GoogleAnalytics />
      <Main />
      <ToastHolder />
      <EditJsonCardHolder />
    </Layout>
  )
}
