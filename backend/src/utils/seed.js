// Seeds realistic demo data (categories + products) so the catalog and
// browsing experience can be tested end to end before the owner has
// added her own products. Run with: npm run seed
//
// Uses plain external image URLs (not Cloudinary uploads) since seed data
// doesn't need managed storage — real products uploaded through the admin
// panel go through Cloudinary as normal.
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import TimeSlot from "../models/TimeSlot.js";
import BusinessSettings from "../models/BusinessSettings.js";
import PaymentAccount from "../models/PaymentAccount.js";

const img = (seed) => ({
  url: `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`,
  publicId: null,
  isPrimary: true,
});

const categoriesData = [
  { name: "Cakes", description: "Our signature handcrafted cakes.", displayOrder: 1 },
  { name: "Cupcakes", description: "Bite-sized treats, made fresh daily.", displayOrder: 2 },
  { name: "Brownies & Desserts", description: "Rich, fudgy, and always fresh.", displayOrder: 3 },
  { name: "Fast Food", description: "Burgers, pizza and more.", displayOrder: 4 },
];

const run = async () => {
  await connectDB();
  console.log("Clearing existing categories & products...");
  await Product.deleteMany({});
  await Category.deleteMany({});

  console.log("Seeding categories...");
  const categories = await Category.insertMany(categoriesData);
  const [cakes, cupcakes, desserts, fastFood] = categories;

  console.log("Seeding products...");

  await Product.create([
    {
      name: "Chocolate Dream Cake",
      category: cakes._id,
      description:
        "Rich chocolate sponge layered with premium chocolate ganache filling.",
      images: [img("photo-1578985545062-69928b1d9587")],
      weightOptions: [
        { label: "1 Pound", price: 1200, isDefault: true },
        { label: "1.5 Pounds", price: 1700 },
        { label: "2 Pounds", price: 2200 },
        { label: "3 Pounds", price: 3200 },
      ],
      shapeOptions: [
        { label: "Circle", priceModifier: 0, isDefault: true },
        { label: "Square", priceModifier: 100 },
        { label: "Heart", priceModifier: 200 },
      ],
      flavorOptions: [{ label: "Chocolate", priceModifier: 0, isDefault: true }],
      fillingOptions: [
        { label: "Chocolate Ganache", priceModifier: 0, isDefault: true },
        { label: "Nutella", priceModifier: 300 },
        { label: "Strawberry", priceModifier: 250 },
      ],
      ingredients: ["Flour", "Cocoa", "Sugar", "Eggs", "Butter", "Chocolate"],
      allergens: ["Eggs", "Dairy", "Gluten"],
      isCustomizable: true,
      isFeatured: true,
      preparationTimeHours: 6,
    },
    {
      name: "Red Velvet Elegance",
      category: cakes._id,
      description: "Classic red velvet with silky cream cheese frosting.",
      images: [img("photo-1586985289906-406988974504")],
      weightOptions: [
        { label: "1 Pound", price: 1400, isDefault: true },
        { label: "2 Pounds", price: 2500 },
        { label: "3 Pounds", price: 3600 },
      ],
      shapeOptions: [
        { label: "Circle", priceModifier: 0, isDefault: true },
        { label: "Heart", priceModifier: 250 },
      ],
      flavorOptions: [{ label: "Red Velvet", priceModifier: 0, isDefault: true }],
      fillingOptions: [
        { label: "Cream Cheese", priceModifier: 0, isDefault: true },
      ],
      allergens: ["Eggs", "Dairy", "Gluten"],
      isCustomizable: true,
      isFeatured: true,
      preparationTimeHours: 6,
    },
    {
      name: "Royal Wedding Cake",
      category: cakes._id,
      description: "A three-tier centerpiece cake for your special day.",
      images: [img("photo-1519340241574-2cec6aef0c01")],
      weightOptions: [{ label: "5 Pounds (3-Tier)", price: 12000, isDefault: true }],
      shapeOptions: [{ label: "Round Tiered", priceModifier: 0, isDefault: true }],
      flavorOptions: [
        { label: "Vanilla", priceModifier: 0, isDefault: true },
        { label: "Chocolate", priceModifier: 500 },
      ],
      fillingOptions: [{ label: "Vanilla Cream", priceModifier: 0, isDefault: true }],
      allergens: ["Eggs", "Dairy", "Gluten"],
      isCustomizable: true,
      preparationTimeHours: 48,
    },
    {
      name: "Assorted Cupcake Box (6 pcs)",
      category: cupcakes._id,
      description: "A mix of our most-loved cupcake flavors.",
      images: [img("photo-1587668178277-295251f900ce")],
      weightOptions: [
        { label: "Box of 6", price: 900, isDefault: true },
        { label: "Box of 12", price: 1700 },
      ],
      flavorOptions: [
        { label: "Assorted", priceModifier: 0, isDefault: true },
        { label: "All Chocolate", priceModifier: 100 },
      ],
      allergens: ["Eggs", "Dairy", "Gluten"],
      preparationTimeHours: 3,
      isFeatured: true,
    },
    {
      name: "Fudge Brownie Box",
      category: desserts._id,
      description: "Dense, fudgy chocolate brownies, baked fresh.",
      images: [img("photo-1606313564200-e75d5e30476c")],
      weightOptions: [
        { label: "Box of 4", price: 700, isDefault: true },
        { label: "Box of 8", price: 1300 },
      ],
      allergens: ["Eggs", "Dairy", "Gluten"],
      preparationTimeHours: 2,
    },
    {
      name: "Classic Beef Burger",
      category: fastFood._id,
      description: "Juicy beef patty, fresh veggies, house sauce.",
      images: [img("photo-1568901346375-23c9450c58cd")],
      weightOptions: [{ label: "Regular", price: 550, isDefault: true }],
      extraOptionGroups: [
        {
          name: "Size",
          selectionType: "single",
          required: true,
          options: [
            { label: "Regular", priceModifier: 0, isDefault: true },
            { label: "Large", priceModifier: 150 },
          ],
        },
        {
          name: "Spice Level",
          selectionType: "single",
          required: false,
          options: [
            { label: "Mild", priceModifier: 0, isDefault: true },
            { label: "Medium", priceModifier: 0 },
            { label: "Spicy", priceModifier: 0 },
          ],
        },
        {
          name: "Add-ons",
          selectionType: "multiple",
          required: false,
          options: [
            { label: "Extra Cheese", priceModifier: 100 },
            { label: "Extra Patty", priceModifier: 250 },
          ],
        },
      ],
      allergens: ["Gluten", "Dairy"],
      preparationTimeHours: 1,
    },
    {
      name: "Margherita Pizza",
      category: fastFood._id,
      description: "Classic mozzarella and basil on a hand-tossed crust.",
      images: [img("photo-1565299624946-b28f40a0ae38")],
      weightOptions: [
        { label: "Small (9\")", price: 900, isDefault: true },
        { label: "Medium (12\")", price: 1400 },
        { label: "Large (15\")", price: 1900 },
      ],
      extraOptionGroups: [
        {
          name: "Crust",
          selectionType: "single",
          required: true,
          options: [
            { label: "Hand-tossed", priceModifier: 0, isDefault: true },
            { label: "Thin Crust", priceModifier: 0 },
            { label: "Stuffed Crust", priceModifier: 250 },
          ],
        },
        {
          name: "Toppings",
          selectionType: "multiple",
          required: false,
          options: [
            { label: "Mushroom", priceModifier: 100 },
            { label: "Olives", priceModifier: 80 },
            { label: "Extra Cheese", priceModifier: 150 },
          ],
        },
      ],
      allergens: ["Gluten", "Dairy"],
      preparationTimeHours: 1,
      isFeatured: true,
    },
  ]);

  console.log("Seeding global time slots...");
  await TimeSlot.deleteMany({});
  await TimeSlot.insertMany([
    { label: "10:00 AM – 12:00 PM", startTime: "10:00", endTime: "12:00", fulfillmentTypes: ["delivery", "pickup"], capacity: 3, displayOrder: 1 },
    { label: "12:00 PM – 2:00 PM", startTime: "12:00", endTime: "14:00", fulfillmentTypes: ["pickup"], capacity: 3, displayOrder: 2 },
    { label: "2:00 PM – 4:00 PM", startTime: "14:00", endTime: "16:00", fulfillmentTypes: ["delivery", "pickup"], capacity: 3, displayOrder: 3 },
    { label: "4:00 PM – 6:00 PM", startTime: "16:00", endTime: "18:00", fulfillmentTypes: ["delivery", "pickup"], capacity: 4, displayOrder: 4 },
    { label: "6:00 PM – 8:00 PM", startTime: "18:00", endTime: "20:00", fulfillmentTypes: ["delivery", "pickup"], capacity: 4, displayOrder: 5 },
  ]);

  console.log("Seeding business settings...");
  await BusinessSettings.deleteMany({});
  await BusinessSettings.create({
    businessName: "Bk_Bakers",
    slogan: "Artistry You Can Taste",
    phone: "0300 1234567",
    whatsapp: "0300 1234567",
    email: "hello@bkbakers.com",
    aboutText: "Handcrafted cakes and treats, baked fresh to order.",
    delivery: {
      enabled: true,
      defaultFee: 300,
      instructions: "Please be available at the delivery address during your selected time slot.",
      zones: [
        { name: "Zone A — City Center", fee: 200, isActive: true },
        { name: "Zone B — Suburbs", fee: 300, isActive: true },
        { name: "Zone C — Outskirts", fee: 500, isActive: true },
      ],
    },
    pickup: {
      enabled: true,
      address: "Shop 12, Bakers Lane, Kohat, KPK",
      hours: "10:00 AM – 8:00 PM, daily",
      instructions: "Please bring your order number when collecting.",
      contactNumber: "0300 1234567",
    },
    minAdvanceNoticeHours: 24,
    sameDayCutoffTime: "14:00",
    maxOrdersPerDay: 15,
    schedulingHorizonDays: 21,
  });

  console.log("Seeding payment accounts...");
  await PaymentAccount.deleteMany({});
  await PaymentAccount.insertMany([
    {
      provider: "EasyPaisa",
      accountTitle: "Bk_Bakers",
      accountNumber: "0300 1234567",
      instructions: "Send the exact order total and upload your receipt screenshot.",
      displayOrder: 1,
    },
    {
      provider: "JazzCash",
      accountTitle: "Bk_Bakers",
      accountNumber: "0301 7654321",
      instructions: "Send the exact order total and upload your receipt screenshot.",
      displayOrder: 2,
    },
    {
      provider: "Bank",
      accountTitle: "Bk_Bakers Enterprises",
      accountNumber: "01234567890123",
      bankName: "Meezan Bank",
      iban: "PK00MEZN0001234567890123",
      instructions: "Bank transfers may take a few hours to reflect — please upload your receipt.",
      displayOrder: 3,
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
