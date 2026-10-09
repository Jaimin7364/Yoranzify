import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("provides account and wishlist access in the mobile menu", () => {
    render(<CartProvider><StoreHeader /></CartProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const accountNavigation = screen.getByRole("navigation", { name: "Account navigation" });
    expect(within(accountNavigation).getByRole("link", { name: /My account/i })).toHaveAttribute("href", "/account");
    expect(within(accountNavigation).getByRole("link", { name: /Wishlist/i })).toHaveAttribute("href", "/account/wishlist");
  });
});
