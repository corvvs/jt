import { useEffect, useLayoutEffect } from "react";

/**
 * ペイント前に走らせたい副作用のための useLayoutEffect.
 *
 * useLayoutEffect はサーバでは動かず警告が出るので, SSR 中だけ useEffect に落とす.
 * 「描画されてから1フレーム遅れて位置が決まる」のを避けたいときに使う.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined"
  ? useLayoutEffect
  : useEffect;
