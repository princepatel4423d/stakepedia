import { body } from "express-validator";

export const createAIToolValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("url").isURL().withMessage("Valid URL is required"),
  body("categories").isArray({ min: 1 }).withMessage("At least one category is required"),
  body("categories.*").isMongoId().withMessage("Each category must be a valid ID"),
  body("pricing")
    .optional()
    .isIn(["free", "freemium", "paid", "open-source", "contact"])
    .withMessage("Invalid pricing type"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Invalid status"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
  body("prompts").optional().isArray().withMessage("Prompts must be an array"),
  body("prompts.*").optional().isMongoId().withMessage("Each prompt must be a valid ID"),
  body("features").optional().isArray(),
  body("useCases").optional().isArray(),
  body("promptTips").optional().isArray(),
  body("pros").optional().isArray(),
  body("cons").optional().isArray(),
  body("tutorials").optional().isArray().withMessage("Tutorials must be an array"),
  body("tutorials.*.title").optional().trim().notEmpty().withMessage("Tutorial title is required"),
  body("tutorials.*.youtubeUrl").optional().isURL().withMessage("Tutorial URL must be valid"),
  body("tutorials.*.level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "all"])
    .withMessage("Invalid tutorial level"),
  body("pricingPlans").optional().isArray().withMessage("Pricing plans must be an array"),
  body("pricingPlans.*.name").optional().trim().notEmpty().withMessage("Plan name is required"),
  body("pricingPlans.*.priceLabel").optional().trim().notEmpty().withMessage("Plan price label is required"),
  body("pricingPlans.*.ctaUrl").optional({ values: "falsy" }).isURL().withMessage("Plan CTA URL must be valid"),
  body("pricingPlans.*.features").optional().isArray(),
  body("faqs").optional().isArray().withMessage("FAQs must be an array"),
  body("faqs.*.question").optional().trim().notEmpty().withMessage("FAQ question is required"),
  body("faqs.*.answer").optional().trim().notEmpty().withMessage("FAQ answer is required"),
  body("foundedYear").optional({ values: "falsy" }).isInt({ min: 1950, max: 2100 }),
  body("freeTrialDays").optional({ values: "falsy" }).isInt({ min: 0, max: 365 }),
  body("docsUrl").optional({ values: "falsy" }).isURL().withMessage("Docs URL must be valid"),
  body("socialMedia.website").optional({ values: "falsy" }).isURL().withMessage("Social website URL must be valid"),
  body("socialMedia.x").optional({ values: "falsy" }).isURL().withMessage("X profile URL must be valid"),
  body("socialMedia.linkedin").optional({ values: "falsy" }).isURL().withMessage("LinkedIn URL must be valid"),
  body("socialMedia.youtube").optional({ values: "falsy" }).isURL().withMessage("YouTube URL must be valid"),
  body("supportEmail").optional({ values: "falsy" }).isEmail().withMessage("Support email must be valid"),
];

export const updateAIToolValidator = [
  body("name").optional().trim().notEmpty().isLength({ max: 100 }),
  body("url").optional().isURL().withMessage("Valid URL is required"),
  body("categories").optional().isArray().withMessage("Categories must be an array"),
  body("categories.*").optional().isMongoId().withMessage("Each category must be a valid ID"),
  body("pricing")
    .optional()
    .isIn(["free", "freemium", "paid", "open-source", "contact"]),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"]),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim().notEmpty().withMessage("Each tag must be a non-empty string"),
  body("prompts").optional().isArray().withMessage("Prompts must be an array"),
  body("prompts.*").optional().isMongoId().withMessage("Each prompt must be a valid ID"),
  body("features").optional().isArray(),
  body("useCases").optional().isArray(),
  body("promptTips").optional().isArray(),
  body("pros").optional().isArray(),
  body("cons").optional().isArray(),
  body("tutorials").optional().isArray().withMessage("Tutorials must be an array"),
  body("tutorials.*.title").optional().trim().notEmpty().withMessage("Tutorial title is required"),
  body("tutorials.*.youtubeUrl").optional().isURL().withMessage("Tutorial URL must be valid"),
  body("tutorials.*.level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "all"])
    .withMessage("Invalid tutorial level"),
  body("pricingPlans").optional().isArray().withMessage("Pricing plans must be an array"),
  body("pricingPlans.*.name").optional().trim().notEmpty().withMessage("Plan name is required"),
  body("pricingPlans.*.priceLabel").optional().trim().notEmpty().withMessage("Plan price label is required"),
  body("pricingPlans.*.ctaUrl").optional({ values: "falsy" }).isURL().withMessage("Plan CTA URL must be valid"),
  body("pricingPlans.*.features").optional().isArray(),
  body("faqs").optional().isArray().withMessage("FAQs must be an array"),
  body("faqs.*.question").optional().trim().notEmpty().withMessage("FAQ question is required"),
  body("faqs.*.answer").optional().trim().notEmpty().withMessage("FAQ answer is required"),
  body("foundedYear").optional({ values: "falsy" }).isInt({ min: 1950, max: 2100 }),
  body("freeTrialDays").optional({ values: "falsy" }).isInt({ min: 0, max: 365 }),
  body("docsUrl").optional({ values: "falsy" }).isURL().withMessage("Docs URL must be valid"),
  body("socialMedia.website").optional({ values: "falsy" }).isURL().withMessage("Social website URL must be valid"),
  body("socialMedia.x").optional({ values: "falsy" }).isURL().withMessage("X profile URL must be valid"),
  body("socialMedia.linkedin").optional({ values: "falsy" }).isURL().withMessage("LinkedIn URL must be valid"),
  body("socialMedia.youtube").optional({ values: "falsy" }).isURL().withMessage("YouTube URL must be valid"),
  body("supportEmail").optional({ values: "falsy" }).isEmail().withMessage("Support email must be valid"),
];