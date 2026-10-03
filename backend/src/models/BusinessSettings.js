import mongoose from "mongoose";

// Singleton document — there is only ever one BusinessSettings record.
// Everything here is admin-controlled and drives fulfillment/checkout
// behavior; nothing about delivery/pickup/cutoffs is ever hardcoded.
const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Bk_Bakers" },
    slogan: { type: String, default: "Artistry You Can Taste" },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    aboutText: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },

    delivery: {
      enabled: { type: Boolean, default: true },
      defaultFee: { type: Number, default: 0, min: 0 },
      instructions: { type: String, default: "" },
      zones: {
        type: [
          {
            name: { type: String, required: true },
            fee: { type: Number, required: true, min: 0 },
            isActive: { type: Boolean, default: true },
          },
        ],
        default: [],
      },
    },

    pickup: {
      enabled: { type: Boolean, default: true },
      address: { type: String, default: "" },
      hours: { type: String, default: "" },
      instructions: { type: String, default: "" },
      contactNumber: { type: String, default: "" },
    },

    // Independent ON/OFF toggles — if a method is off, the frontend must
    // never show it AND the backend must reject an order that tries to
    // use it anyway.
    payments: {
      onlineEnabled: { type: Boolean, default: true },
      cashEnabled: { type: Boolean, default: true },
    },

    // Scheduling defaults — a product's own preparationTimeHours always
    // wins if it's stricter than this global floor.
    minAdvanceNoticeHours: { type: Number, default: 24, min: 0 },
    // "HH:mm" 24h. After this time, same-day slots stop being offered.
    sameDayCutoffTime: { type: String, default: null },
    maxOrdersPerDay: { type: Number, default: 15, min: 1 },
    schedulingHorizonDays: { type: Number, default: 21, min: 1, max: 90 },
  },
  { timestamps: true }
);

businessSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const BusinessSettings = mongoose.model("BusinessSettings", businessSettingsSchema);

export default BusinessSettings;
