'use client'
import { atom, useAtom } from 'jotai';
import { useState } from 'react';

const itemName = "autoTrimming";

function saveItem(regexp: string) {
  localStorage.setItem(itemName, regexp);
}

function loadItem(): string {
  try {
    if (typeof window !== 'undefined') {
      const regexp = localStorage.getItem(itemName);
        if (regexp) {
          const _ = new RegExp(regexp); // Validate regexp
          return regexp;
      }
    }
  } catch (e) {
    console.error("Invalid regexp in reading:", e);
  }
  return "";
}

const itemAtom = atom(loadItem());

export function useAutoTrimming() {
  const [autoTrimming, setAutoTrimming] = useAtom(itemAtom);
  const [isValid, setIsValid] = useState(true);

  const save = (regexp: string) => {
    const trimmed = regexp.trim();
    setAutoTrimming(trimmed);
    try {
      const _ = new RegExp(trimmed); // Validate regexp
      saveItem(trimmed);
      setIsValid(true);
      return;
    } catch (e) {
      console.error("Invalid regexp in auto trimming:", e);
    }
    setIsValid(false);
  };

  return {
    autoTrimming,
    setAutoTrimming: save,
    isValid
  };
}
