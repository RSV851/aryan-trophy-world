import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { subcategories } from "./subcategories";
import { productTypes } from "./product-types";
import { materials } from "./materials";
import { themes } from "./themes";
import { shapes } from "./shapes";
import { collections } from "./collections";
import { products } from "./products";
import { productMaterials } from "./product-materials";
import { productThemes } from "./product-themes";
import { productShapes } from "./product-shapes";
import { productCollections } from "./product-collections";
import { productImages } from "./product-images";
import { pricingMatrix } from "./pricing-matrix";
import { inquiries } from "./inquiries";
import { inquiryProducts } from "./inquiry-products";

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  products: many(products),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productTypesRelations = relations(productTypes, ({ many }) => ({
  products: many(products),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  productMaterials: many(productMaterials),
}));

export const themesRelations = relations(themes, ({ many }) => ({
  productThemes: many(productThemes),
}));

export const shapesRelations = relations(shapes, ({ many }) => ({
  productShapes: many(productShapes),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  productCollections: many(productCollections),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  type: one(productTypes, {
    fields: [products.typeId],
    references: [productTypes.id],
  }),
  productMaterials: many(productMaterials),
  productThemes: many(productThemes),
  productShapes: many(productShapes),
  productCollections: many(productCollections),
  images: many(productImages),
  pricingMatrix: many(pricingMatrix),
  inquiryProducts: many(inquiryProducts),
}));

export const productMaterialsRelations = relations(productMaterials, ({ one }) => ({
  product: one(products, {
    fields: [productMaterials.productId],
    references: [products.id],
  }),
  material: one(materials, {
    fields: [productMaterials.materialId],
    references: [materials.id],
  }),
}));

export const productThemesRelations = relations(productThemes, ({ one }) => ({
  product: one(products, {
    fields: [productThemes.productId],
    references: [products.id],
  }),
  theme: one(themes, {
    fields: [productThemes.themeId],
    references: [themes.id],
  }),
}));

export const productShapesRelations = relations(productShapes, ({ one }) => ({
  product: one(products, {
    fields: [productShapes.productId],
    references: [products.id],
  }),
  shape: one(shapes, {
    fields: [productShapes.shapeId],
    references: [shapes.id],
  }),
}));

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, {
    fields: [productCollections.productId],
    references: [products.id],
  }),
  collection: one(collections, {
    fields: [productCollections.collectionId],
    references: [collections.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const pricingMatrixRelations = relations(pricingMatrix, ({ one }) => ({
  product: one(products, {
    fields: [pricingMatrix.productId],
    references: [products.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ many }) => ({
  inquiryProducts: many(inquiryProducts),
}));

export const inquiryProductsRelations = relations(inquiryProducts, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryProducts.inquiryId],
    references: [inquiries.id],
  }),
  product: one(products, {
    fields: [inquiryProducts.productId],
    references: [products.id],
  }),
}));
