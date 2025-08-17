import { Main } from "@/components/Main";
import { DocumentList } from "@/components/DocumentList";
import Layout from "@/components/Layout";
import { ToastHolder } from "@/components/toast/ToastHolder";
import { useEffect, useState } from "react";
import { GoogleAnalytics } from '../components/gtag'
import { EditJsonCardHolder } from "@/components/holders/modal/EditJsonCard";
import { useRouter } from "next/router";
import { ThemeObserver } from "@/components/holders/ThemeObserver";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { PreformattedValueCardHolder } from "@/components/holders/modal/PreformattedValueCard";

export default function Home() {
  const router = useRouter();
  const [docId] = (router.query.docId || []) as string[];
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);

  // ルーターの準備ができていない場合は何も表示しない
  if (!router.isReady || !shouldRender) { 
    return null; 
  }
  
  const effectiveDocId = docId || '_list';

  // _listパスの場合はドキュメント一覧を表示
  const isDocumentListView = effectiveDocId === '_list';
    
  return (
    <Layout>
      <GoogleAnalytics />
      {isDocumentListView ? <DocumentList /> : <Main docId={effectiveDocId} />}
      <ToastHolder />
      <EditJsonCardHolder />
      <PreformattedValueCardHolder />
      <ThemeObserver />
      <SpeedInsights />
      <Analytics />
    </Layout>
  )
}
