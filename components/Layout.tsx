import Head from "next/head";
import { ReactNode, useState } from "react";
import { VscEdit } from 'react-icons/vsc';
import { InlineIcon } from "./lv1/InlineIcon";
import { Modal } from "./Modal";
import { EditJsonCard } from "./json/EditJsonCard";
import { MenuButton, MenuToggleButton } from "./lv1/MenuButton";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { ToggleState, useToggleState } from "@/states/view";
import { useJSON } from "@/states";
import { usePreference } from "@/states/preference";

const MenuBar = () => {
  const { flatJsons } = useJSON();
  const { setToggleState } = useToggleState();
  const { preference, setPreference } = usePreference();
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };
  return (<div className='shrink-0 grow-0 flex gap-2 flex-row items-center border-b-[1px] px-2'>
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <EditJsonCard closeModal={closeModal} />
    </Modal>

    <h2>J.E.T</h2>

    <div className='flex flex-row gap-2'>
      <MenuButton
        onClick={() => openModal()}
      >
        <InlineIcon i={<VscEdit />} />Edit Text
      </MenuButton>

      <MenuButton
        onClick={() => setToggleState({})}
      >
        <InlineIcon i={<BsChevronDown />} />Open All
      </MenuButton>

      <MenuButton
        onClick={() => setToggleState(() => {
          const newState: ToggleState = {};
          if (flatJsons?.items) {
            for (const item of flatJsons?.items) {
              if (item.rowItems.length === 0) { continue; }
              const isTogglable = item.right.type === "array" || item.right.type === "map";
              if (isTogglable) {
                newState[item.index] = true;
              }
            }
          }
          return newState;
        })}
      >
        <InlineIcon i={<BsChevronUp />} />Close All
      </MenuButton>

      <MenuToggleButton
        isToggled={preference.visible_subtree_stat}
        onClick={(isToggled) => setPreference((prev) => ({ ...prev, visible_subtree_stat: isToggled }))}
      >
        {preference.visible_subtree_stat ? "Hide" : "Show"} Subtree Stats
      </MenuToggleButton>

    </div>
  </div>
  )
};

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

      <MenuBar />

      <div
        className='flex flex-row shrink grow overflow-hidden'
      >
        {props.children}
      </div>
    </main>
  )
}
