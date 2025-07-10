import ProductCategory from "../models/ProductCategory.js";
import { connectToDb } from "../config/db.js";

const seedCategories = [
  {
    name: "Islamic Wear",
    description: "Traditional Islamic clothing and modest wear for men and women",
    slug: "islamic-wear",
    icon: "shirt",
    color: "#10B981",
    isActive: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 1,
    showInMenu: true,
    showOnHomepage: true,
    metaTitle: "Islamic Wear - Traditional Modest Clothing",
    metaDescription: "Shop our collection of traditional Islamic clothing and modest wear for men and women.",
    attributes: [
      {
        name: "Size",
        type: "select",
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        isRequired: true,
        isFilterable: true
      },
      {
        name: "Color",
        type: "select",
        options: ["Black", "White", "Navy", "Brown", "Gray"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Material",
        type: "select",
        options: ["Cotton", "Polyester", "Silk", "Linen", "Blend"],
        isRequired: false,
        isFilterable: true
      }
    ]
  },
  {
    name: "Prayer Items",
    description: "Essential items for daily prayers and Islamic worship",
    slug: "prayer-items",
    icon: "pray",
    color: "#8B5CF6",
    isActive: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 2,
    showInMenu: true,
    showOnHomepage: true,
    metaTitle: "Prayer Items - Islamic Worship Essentials",
    metaDescription: "Find prayer rugs, tasbeeh, Quran stands and other essential items for Islamic worship.",
    attributes: [
      {
        name: "Material",
        type: "select",
        options: ["Velvet", "Cotton", "Silk", "Synthetic", "Wood"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Size",
        type: "select",
        options: ["Small", "Medium", "Large", "Extra Large"],
        isRequired: false,
        isFilterable: true
      }
    ]
  },
  {
    name: "Books & Literature",
    description: "Islamic books, Quran, Hadith collections and educational materials",
    slug: "books-literature",
    icon: "book",
    color: "#F59E0B",
    isActive: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 3,
    showInMenu: true,
    showOnHomepage: true,
    metaTitle: "Islamic Books & Literature",
    metaDescription: "Explore our collection of Islamic books, Quran, Hadith and educational materials.",
    attributes: [
      {
        name: "Language",
        type: "select",
        options: ["English", "Arabic", "Urdu", "French", "Bilingual"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Format",
        type: "select",
        options: ["Hardcover", "Paperback", "Digital", "Audio"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Author",
        type: "text",
        options: [],
        isRequired: false,
        isFilterable: true
      }
    ]
  },
  {
    name: "MCAN Merchandise",
    description: "Official MCAN branded merchandise and apparel",
    slug: "mcan-merchandise",
    icon: "star",
    color: "#EF4444",
    isActive: true,
    isVisible: true,
    isFeatured: true,
    displayOrder: 4,
    showInMenu: true,
    showOnHomepage: true,
    metaTitle: "MCAN Official Merchandise",
    metaDescription: "Show your support with official MCAN branded merchandise and apparel.",
    attributes: [
      {
        name: "Size",
        type: "select",
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        isRequired: true,
        isFilterable: true
      },
      {
        name: "Color",
        type: "select",
        options: ["Black", "White", "Navy", "Red", "Green"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Type",
        type: "select",
        options: ["T-Shirt", "Hoodie", "Cap", "Mug", "Sticker", "Bag"],
        isRequired: false,
        isFilterable: true
      }
    ]
  },
  {
    name: "Accessories",
    description: "Islamic accessories, jewelry and decorative items",
    slug: "accessories",
    icon: "gem",
    color: "#06B6D4",
    isActive: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 5,
    showInMenu: true,
    showOnHomepage: false,
    metaTitle: "Islamic Accessories & Jewelry",
    metaDescription: "Beautiful Islamic accessories, jewelry and decorative items for your home and personal use.",
    attributes: [
      {
        name: "Material",
        type: "select",
        options: ["Silver", "Gold", "Stainless Steel", "Wood", "Ceramic"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Size",
        type: "select",
        options: ["Small", "Medium", "Large"],
        isRequired: false,
        isFilterable: true
      }
    ]
  },
  {
    name: "Home & Decor",
    description: "Islamic home decoration and lifestyle items",
    slug: "home-decor",
    icon: "home",
    color: "#84CC16",
    isActive: true,
    isVisible: true,
    isFeatured: false,
    displayOrder: 6,
    showInMenu: true,
    showOnHomepage: false,
    metaTitle: "Islamic Home Decor",
    metaDescription: "Beautify your home with Islamic calligraphy, wall art and decorative items.",
    attributes: [
      {
        name: "Material",
        type: "select",
        options: ["Canvas", "Wood", "Metal", "Ceramic", "Glass"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Size",
        type: "select",
        options: ["Small", "Medium", "Large", "Extra Large"],
        isRequired: false,
        isFilterable: true
      },
      {
        name: "Room",
        type: "select",
        options: ["Living Room", "Bedroom", "Kitchen", "Office", "Prayer Room"],
        isRequired: false,
        isFilterable: true
      }
    ]
  }
];

const seedProductCategories = async () => {
  try {
    await connectToDb();
    
    console.log("Seeding product categories...");
    
    // Clear existing categories
    await ProductCategory.deleteMany({});
    
    // Insert seed categories
    const createdCategories = await ProductCategory.insertMany(seedCategories);
    
    console.log(`✅ Successfully seeded ${createdCategories.length} product categories`);
    
    // Display created categories
    createdCategories.forEach(category => {
      console.log(`- ${category.name} (${category.slug})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding product categories:", error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductCategories();
}

export default seedProductCategories;
