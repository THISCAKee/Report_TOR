import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function AppFrame({ children }: Props) {
  return <div data-app-frame="true" className="w-full max-w-none px-4 pt-6 sm:px-6 lg:px-8">{children}</div>;
}
