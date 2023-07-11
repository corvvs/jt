import { useJSON } from "@/states";
import Head from "next/head";
import { ReactNode } from "react";

export default function Layout(props: {
  children: ReactNode;
}) {
  const {
    document,
  } = useJSON();

  const docTitle = document?.name;

  return (
    <main
      className='
        min-h-screen max-h-screen flex flex-col justify-stretch overflow-hidden
      '
    >
      <Head>
        <title>{ docTitle || "JSON Analyzer" }</title>
      </Head>

      <div
        className='flex flex-row shrink grow overflow-hidden'
      >
        {props.children}
      </div>
    </main>
  )
}
