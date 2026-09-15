import { describe, expect, it } from "vitest";
import { buildCategoryTree, categoryInputSchema, filterPublicCategoryTree, slugifyCategory } from "./categories";

describe("category helpers", () => {
  it("creates stable URL slugs", () => {
    expect(slugifyCategory("  Men's T-Shirts & Polos  ")).toBe("men-s-t-shirts-polos");
    expect(slugifyCategory("Été Collection")).toBe("ete-collection");
  });

  it("builds and orders a hierarchy", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const tree = buildCategoryTree([
      { id: 2, name: "Shirts", slug: "shirts", description: null, parentId: 1, imageMediaId: null, displayOrder: 1, isVisible: true, archivedAt: null },
      { id: 3, name: "Jeans", slug: "jeans", description: null, parentId: 1, imageMediaId: null, displayOrder: 0, isVisible: true, archivedAt: date },
      { id: 1, name: "Men", slug: "men", description: null, parentId: null, imageMediaId: null, displayOrder: 0, isVisible: true, archivedAt: null }
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].children.map(({ name }) => name)).toEqual(["Jeans", "Shirts"]);
    expect(tree[0].children[0].archivedAt).toBe(date.toISOString());
  });

  it("validates category fields", () => {
    expect(categoryInputSchema.safeParse({ name: "M", parentId: null, imageMediaId: null, displayOrder: 0, isVisible: true }).success).toBe(false);
  });

  it("does not promote children of a hidden parent into the public tree", () => {
    const tree = buildCategoryTree([
      { id: 1, name: "Hidden", slug: "hidden", description: null, parentId: null, imageMediaId: null, displayOrder: 0, isVisible: false, archivedAt: null },
      { id: 2, name: "Visible child", slug: "visible-child", description: null, parentId: 1, imageMediaId: null, displayOrder: 0, isVisible: true, archivedAt: null }
    ]);
    expect(filterPublicCategoryTree(tree)).toEqual([]);
  });
});
