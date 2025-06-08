'use client'
import { atom, useAtom } from 'jotai';
import { useState } from 'react';

const itemName = "autoTrimming";

function saveAutoTrimming(regexp: string) {
  localStorage.setItem(itemName, regexp);
}

function loadAutoTrimming(): string {
  try {
    const regexp = localStorage.getItem(itemName);
      if (regexp) {
        const _ = new RegExp(regexp); // Validate regexp
        return regexp;
    }
  } catch (e) {
    console.error("Invalid regexp in auto trimming:", e);
  }
  return "";
}

const autoTrimmingAtom = atom(loadAutoTrimming());

export function useAutoTrimming() {
  const [autoTrimming, setAutoTrimming] = useAtom(autoTrimmingAtom);
  const [isValid, setIsValid] = useState(true);

  const save = (regexp: string) => {
    const trimmed = regexp.trim();
    setAutoTrimming(regexp);
    try {
      const _ = new RegExp(trimmed); // Validate regexp
      saveAutoTrimming(regexp);
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
