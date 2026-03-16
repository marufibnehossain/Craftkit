"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type BreadcrumbContextValue = {
  label: string | null;
  setLabel: (label: string | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function useBreadcrumbLabel() {
  const ctx = useContext(BreadcrumbContext);
  return ctx?.label ?? null;
}

export function useSetBreadcrumbLabel() {
  const ctx = useContext(BreadcrumbContext);
  return ctx?.setLabel ?? (() => {});
}

export function BreadcrumbLabelProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  return (
    <BreadcrumbContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/** Call from a page (e.g. blog post) to set the breadcrumb end segment. Clears on unmount. */
export function BreadcrumbLabel({ label }: { label: string }) {
  const setLabel = useSetBreadcrumbLabel();
  useEffect(() => {
    setLabel(label);
    return () => setLabel(null);
  }, [label, setLabel]);
  return null;
}
