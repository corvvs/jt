'use client'
import { atom, useAtom } from 'jotai';
import { useState } from 'react';

export const DataFormats = ["json", "jsonl"] as const;
export type DataFormat = typeof DataFormats[number];
export const DefaultDataFormat: DataFormat = "json";

const itemName = "dataFormat";

function saveItem(regexp: DataFormat) {
  localStorage.setItem(itemName, regexp);
}

function loadItem(): DataFormat {
  try {
    if (typeof window !== 'undefined') {
      const regexp = localStorage.getItem(itemName);
        if (regexp) {
          const _ = new RegExp(regexp); // Validate regexp
          return regexp as DataFormat;
      }
    }
  } catch (e) {
      console.error("Invalid regexp in reading:", e);
  }
  return DefaultDataFormat;
}

const itemAtom = atom(loadItem());

export function useDataFormat() {
  const [dataFormat, setDataFormat] = useAtom(itemAtom);
  const [isValid, setIsValid] = useState(true);

  const save = (regexp: DataFormat) => {
    setDataFormat(regexp);
    try {
      saveItem(regexp);
      setIsValid(true);
      return;
    } catch (e) {
      console.error("Invalid regexp in reading:", e);
    }
    setIsValid(false);
  };

  return {
    dataFormat,
    setDataFormat: save,
    isValid
  };
}
