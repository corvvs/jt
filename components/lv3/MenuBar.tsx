import { useState } from "react";
import { VscEdit } from 'react-icons/vsc';
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { Modal } from "@/components/Modal";
import { EditJsonCard } from "@/components/json/EditJsonCard";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useToggleState } from "@/states/view";
import { useJSON } from "@/states";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";

export const MenuBar = () => {
  const { flatJsons } = useJSON();
  const { openAll, closeAll } = useToggleState();
  const { preference, setPreference } = usePreference();
  const { manipulation } = useManipulation();
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

    <div className='flex flex-row items-center gap-2'>
      <MenuButton
        onClick={() => openModal()}
      >
        <InlineIcon i={<VscEdit />} />Edit Text
      </MenuButton>

      <MenuButton
        onClick={() => openAll(manipulation.narrowedRange || undefined)}
      >
        <InlineIcon i={<BsChevronDown />} />Open All
      </MenuButton>

      <MenuButton
        onClick={() => {
          const items = flatJsons?.items;
          if (!items) { return; }
          closeAll(items, manipulation.narrowedRange || undefined)
        }}
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