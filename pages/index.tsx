import Image from 'next/image'
import { useJSON } from '@/states'
import { JsonStructure } from '@/components/json/JsonStructure';
import Head from 'next/head';

export default function Home() {
  const { rawText, setRawtext, jsonStructure }  = useJSON();
  console.log(jsonStructure);
  return (
    <main
      className='
        min-h-screen max-h-screen flex flex-col justify-stretch overflow-hidden
      '
    >
      <Head>
        <title>Jet</title>
      </Head>
      <div
        className='flex flex-row shrink grow overflow-hidden'
      >
        <div className='flex flex-col flex-auto overflow-hidden'>
          <div className='fixed z-10 right-[1.2em] px-2 py-1 flex justify-end bg-black text-white'>
            <h3>構造</h3>
          </div>

          <div className='shrink grow font-mono text-sm overflow-scroll'>
            { jsonStructure ? <JsonStructure js={jsonStructure} /> : null }
          </div>
        </div>


        {
          false ? <div className='flex flex-col flex-auto p-2 overflow-hidden'>
            <h3>テキスト</h3>
            <div className='shrink grow border-2 overflow-scroll'>
              <code className='p-2 text-sm whitespace-pre'>{rawText}</code>
            </div>
          </div> : null
        }
        </div>
    </main>
  )
}
