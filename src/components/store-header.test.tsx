import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreHeader } from "./store-header";
import { CartProvider } from "./cart";

describe("StoreHeader", () => {
  it("opens and closes search", () => {
    render(<CartProvider><StoreHeader /></CartProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("textbox", { name: "Search products" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-expanded", "false");
  });
});
