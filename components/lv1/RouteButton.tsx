import { Route, useMyRoute } from "@/states";
import React, { ReactNode } from "react";

export const RouteButton = (props: {
  route: Route;
  children: ReactNode;
  className?: string;
}) => {
  const { route, setRoute } = useMyRoute();
  const isActive = route === props.route;
  return (
    <button
      {...{ ...props }}
      className={
        ' border-[1px] py-1 px-2 font-bold text-center ' + (props.className || '') + (isActive ? 'route-active' : '')
      }
      onClick={() => setRoute(props.route)}
    />
  );
};
