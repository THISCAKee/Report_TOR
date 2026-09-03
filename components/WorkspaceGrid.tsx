import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
};

export function WorkspaceGrid({ left, middle, right }: Props) {
  return <div data-workspace-grid="true" className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(16rem,.7fr)_minmax(18rem,1.5fr)_minmax(18rem,.85fr)] xl:grid-cols-[minmax(20rem,.7fr)_minmax(20rem,1.5fr)_minmax(24rem,.85fr)]"><div className="min-w-0">{left}</div><div className="min-w-0">{middle}</div><div className="min-w-0">{right}</div></div>;
}
