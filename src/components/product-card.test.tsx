import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductCard } from "./product-card";
import { WishlistProvider } from "./wishlist";

afterEach(() => vi.unstubAllGlobals());

describe("ProductCard", () => {
  it("saves a product through the wishlist", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, count: 0, items: [] }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, count: 1, items: [{ id: 2, productId: 10, variantId: null }] }) }));
    render(<WishlistProvider><ProductCard productId={10} name="Test shirt" meta="Olive" price="₹999" art="art-one" /></WishlistProvider>);
    await waitFor(() => expect(screen.getByRole("button", { name: /Add Test shirt/ })).toBeEnabled());
    const button = screen.getByRole("button", { name: /Add Test shirt/ });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("button", { name: /Remove Test shirt/ })).toHaveAttribute("aria-pressed", "true"));
  });
});
