import { JsonText } from "@/components/JsonText";
import { JsonViewer } from "@/components/JsonViewer";
import Layout from "@/components/Layout";
import { useMyRoute } from "@/states";


const useContent = () => {
  const { route } = useMyRoute();
  switch (route) {
    case 'view': return JsonViewer;
    case 'text': return JsonText;
  }
}

export default function Home() {
  const Content = useContent();
  return (
    <Layout>
      <Content />
    </Layout>
  )
}
