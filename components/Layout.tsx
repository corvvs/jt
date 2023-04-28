import Head from "next/head";
import { ReactNode } from "react";

export default function Layout(props: {
  children: ReactNode;
}) {
  return (
    <main
      className='
        min-h-screen max-h-screen flex flex-col justify-stretch overflow-hidden
      '
    >
      <Head>
        <title>Jet</title>
      </Head>

      <div className='shrink-0 grow-0 flex gap-2 flex-row border-b-[1px] p-2'>
        <h2>JET.</h2>

        <div className='flex flex-row gap-0'>

        </div>
      </div>

      <div
        className='flex flex-row shrink grow overflow-hidden'
      >
        {props.children}
      </div>
    </main>
  )
}
