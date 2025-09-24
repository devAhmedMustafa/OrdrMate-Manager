import { useContext } from "react";
import { VirtualCartContext } from "./VirtualCart";

export default function useVirtualCart() {
  const ctx = useContext(VirtualCartContext);
  if (!ctx) throw new Error("useVirtualCart must be used within VirtualCartProvider");
  return ctx;
}
