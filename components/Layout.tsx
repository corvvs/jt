import Head from "next/head";
import { ReactNode } from "react";
import { RouteButton } from "./lv1/RouteButton";
import { VscEdit, VscJson } from 'react-icons/vsc';
import { InlineIcon } from "./lv1/InlineIcon";

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

      <div className='shrink-0 grow-0 flex gap-2 flex-row items-center border-b-[1px] px-2'>
        <h2>JET.</h2>

        <div className='flex flex-row gap-0'>
        <RouteButton route="view"><InlineIcon i={<VscJson />} />View</RouteButton>
        <RouteButton route="text"><InlineIcon i={<VscEdit />} />Edit</RouteButton>
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
