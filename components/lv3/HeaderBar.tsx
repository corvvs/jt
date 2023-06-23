import { useState } from "react";
import { VscEdit } from 'react-icons/vsc';
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { Modal } from "@/components/Modal";
import { EditJsonCard } from "@/components/json/EditJsonCard";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { useToggleState } from "@/states/view";
import { useJSON } from "@/states";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";
import { SimpleFilterPanel } from "../lv2/SimpleFilterPanel";
import _ from "lodash";

const MassManipulationButtons = () => {
  const { flatJsons } = useJSON();
  const { openAll, closeAll } = useToggleState();
  const { preference, setPreference } = usePreference();
  const { manipulation } = useManipulation();
  const items = flatJsons?.items;
  if (!items) { return null; }

  return <>

    <MenuButton
      onClick={() => closeAll(items, _.last(manipulation.narrowedRanges))}
    >
      <InlineIcon i={<HiChevronDoubleUp />} />Fold All
    </MenuButton>

    <MenuButton
      onClick={() => openAll(_.last(manipulation.narrowedRanges))}
    >
      <InlineIcon i={<HiChevronDoubleDown />} />Unfold All
    </MenuButton>

    { false &&
      <MenuToggleButton
        isToggled={preference.visible_subtree_stat}
        onClick={(isToggled) => setPreference((prev) => ({ ...prev, visible_subtree_stat: isToggled }))}
      >
        {preference.visible_subtree_stat ? "Hide" : "Show"} Subtree Stats
      </MenuToggleButton>
    }
  </>
}

export const HeaderBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };
  return (<>
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <EditJsonCard closeModal={closeModal} />
    </Modal>

    <h2>JSON Analyzer(alpha)</h2>

    <div className='flex flex-row items-center gap-2'>
      <MenuButton
        onClick={() => openModal()}
      >
        <InlineIcon i={<VscEdit />} />Edit Text
      </MenuButton>

      <MassManipulationButtons />

      <SimpleFilterPanel />

    </div>
  </>
  )
};