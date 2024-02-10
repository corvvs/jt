import { Main } from "@/components/Main";
import Layout from "@/components/Layout";
import { ToastHolder } from "@/components/toast/ToastHolder";
import { useEffect, useState } from "react";
import { GoogleAnalytics } from '../components/gtag'
import { EditJsonCardHolder } from "@/components/holders/modal/EditJsonCard";
import { useRouter } from "next/router";
import { ThemeObserver } from "@/components/holders/ThemeObserver";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  const router = useRouter();
  const [docId] = (router.query.docId || []) as string[];
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);

  if (!shouldRender) { return null; }
  return (
    <Layout>
      <GoogleAnalytics />
      <Main docId={docId} />
      <ToastHolder />
      <EditJsonCardHolder />
      <ThemeObserver />
      <SpeedInsights />
    </Layout>
  )
}
