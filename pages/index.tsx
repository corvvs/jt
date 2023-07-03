import { Main } from "@/components/Main";
import Layout from "@/components/Layout";
import { ToastHolder } from "@/components/toast/ToastHolder";
import { Suspense, useEffect, useState } from "react";
import { GoogleAnalytics } from '../components/gtag'
import { EditJsonCardHolder } from "@/components/holders/modal/EditJsonCard";

export default function Home() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(true);
  }, []);

  if (!shouldRender) { return null; }
  return (
    <Layout>
      <GoogleAnalytics />
      <Suspense fallback={<div>hello...</div>}>
        <Main />
      </Suspense>
      <ToastHolder />
      <EditJsonCardHolder />
    </Layout>
  )
}
