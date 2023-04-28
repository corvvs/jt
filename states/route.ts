import { atom, useAtom } from 'jotai';

const Routes = ["view", "text"] as const;
export type Route = typeof Routes[number];

const routeAtom = atom<Route>("view");

export const useMyRoute = () => {
  const [route, setRoute] = useAtom(routeAtom);
  return { route, setRoute };
};
