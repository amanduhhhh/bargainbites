import type { ReactNode } from "react";

export default async function Template({
  children,
}: {
  children: ReactNode;
}) {
  // Artificial delay for smoother transitions
  await new Promise((resolve) => setTimeout(resolve, 100));
  return <>{children}</>;
}
