/**
 * Product Seeding Script
 * Seeds 5 products for each category in the system
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  BASE_URL: 'https://mcanlogde1.onrender.com',
  ADMIN_USER: {
    email: 'ahmed.hassan@mcanenugu.org.ng',
    password: 'Ahmed123!'
  }
};

// Product templates for each category
const PRODUCT_TEMPLATES = {
  'Islamic Wear': [
    {
      name: 'Men\'s Traditional Thobe',
      description: 'High-quality traditional thobe made from premium cotton fabric. Perfect for daily prayers and special occasions.',
      price: 15000,
      comparePrice: 18000,
      sku: 'IW-THOBE-001',
      tags: 'men,traditional,prayer,cotton',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 50, trackQuantity: true })
    },
    {
      name: 'Women\'s Modest Abaya',
      description: 'Elegant black abaya with beautiful embroidery. Made from breathable fabric for comfort and modesty.',
      price: 12000,
      comparePrice: 15000,
      sku: 'IW-ABAYA-001',
      tags: 'women,modest,abaya,embroidery',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 30, trackQuantity: true })
    },
    {
      name: 'Islamic Prayer Cap (Kufi)',
      description: 'Traditional Islamic prayer cap made from soft cotton. Available in multiple colors.',
      price: 2500,
      comparePrice: 3000,
      sku: 'IW-KUFI-001',
      tags: 'men,prayer,cap,kufi',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 100, trackQuantity: true })
    },
    {
      name: 'Women\'s Hijab Collection',
      description: 'Premium quality hijab collection in various colors. Made from soft, breathable fabric.',
      price: 3500,
      comparePrice: 4000,
      sku: 'IW-HIJAB-001',
      tags: 'women,hijab,modest,collection',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 75, trackQuantity: true })
    },
    {
      name: 'Islamic Jubba for Men',
      description: 'Comfortable and stylish jubba perfect for Friday prayers and Islamic gatherings.',
      price: 8500,
      comparePrice: 10000,
      sku: 'IW-JUBBA-001',
      tags: 'men,jubba,friday,prayer',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 40, trackQuantity: true })
    }
  ],
  'Accessories': [
    {
      name: 'Islamic Tasbih Beads (99 Count)',
      description: 'Beautiful wooden tasbih beads for dhikr and meditation. Handcrafted with care.',
      price: 4000,
      comparePrice: 5000,
      sku: 'ACC-TASBIH-001',
      tags: 'tasbih,dhikr,wooden,meditation',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 60, trackQuantity: true })
    },
    {
      name: 'Islamic Wall Clock',
      description: 'Beautiful Islamic wall clock with Arabic calligraphy. Perfect for home decoration.',
      price: 7500,
      comparePrice: 9000,
      sku: 'ACC-CLOCK-001',
      tags: 'clock,wall,calligraphy,decoration',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 25, trackQuantity: true })
    },
    {
      name: 'Quran Stand (Wooden)',
      description: 'Elegant wooden Quran stand for comfortable reading. Adjustable and portable.',
      price: 6000,
      comparePrice: 7500,
      sku: 'ACC-STAND-001',
      tags: 'quran,stand,wooden,reading',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 35, trackQuantity: true })
    },
    {
      name: 'Islamic Calligraphy Art',
      description: 'Beautiful framed Islamic calligraphy art piece. Perfect for home or office.',
      price: 12000,
      comparePrice: 15000,
      sku: 'ACC-ART-001',
      tags: 'art,calligraphy,frame,decoration',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 20, trackQuantity: true })
    },
    {
      name: 'Prayer Rug Travel Size',
      description: 'Compact and lightweight prayer rug perfect for travel. Easy to fold and carry.',
      price: 5500,
      comparePrice: 7000,
      sku: 'ACC-RUG-001',
      tags: 'prayer,rug,travel,portable',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 45, trackQuantity: true })
    }
  ],
  'Socks': [
    {
      name: 'Cotton Prayer Socks',
      description: 'Comfortable cotton socks perfect for prayer time. Soft and breathable.',
      price: 1500,
      comparePrice: 2000,
      sku: 'SOCK-PRAYER-001',
      tags: 'cotton,prayer,comfortable,breathable',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 100, trackQuantity: true })
    },
    {
      name: 'Bamboo Fiber Socks',
      description: 'Eco-friendly bamboo fiber socks with antibacterial properties. Very comfortable.',
      price: 2500,
      comparePrice: 3000,
      sku: 'SOCK-BAMBOO-001',
      tags: 'bamboo,eco-friendly,antibacterial,comfortable',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 80, trackQuantity: true })
    },
    {
      name: 'Wool Blend Winter Socks',
      description: 'Warm wool blend socks perfect for cold weather. Soft and insulating.',
      price: 3000,
      comparePrice: 3500,
      sku: 'SOCK-WOOL-001',
      tags: 'wool,winter,warm,insulating',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 60, trackQuantity: true })
    },
    {
      name: 'Athletic Sports Socks',
      description: 'High-performance athletic socks with moisture-wicking technology.',
      price: 2000,
      comparePrice: 2500,
      sku: 'SOCK-SPORT-001',
      tags: 'athletic,sports,moisture-wicking,performance',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 90, trackQuantity: true })
    },
    {
      name: 'Casual Daily Wear Socks',
      description: 'Comfortable daily wear socks in various colors. Perfect for everyday use.',
      price: 1200,
      comparePrice: 1500,
      sku: 'SOCK-DAILY-001',
      tags: 'casual,daily,comfortable,various-colors',
      isActive: true,
      isVisible: true,
      inventory: JSON.stringify({ quantity: 120, trackQuantity: true })
    }
  ]
};

async function seedProducts() {
  console.log('🌱 Product Seeding Script');
  console.log('=' .repeat(50));
  
  let token = null;
  let categories = [];
  
  try {
    // Step 1: Admin Authentication
    console.log('\n1️⃣ Authenticating as admin...');
    const loginResponse = await axios.post(`${CONFIG.BASE_URL}/auth/api/login`, CONFIG.ADMIN_USER);
    
    if (!loginResponse.data.success) {
      throw new Error(`Admin authentication failed: ${loginResponse.data.message}`);
    }
    
    token = loginResponse.data.token;
    console.log('✅ Admin authenticated successfully');

    // Step 2: Fetch Categories
    console.log('\n2️⃣ Fetching product categories...');
    const categoriesResponse = await axios.get(`${CONFIG.BASE_URL}/api/product-categories`);
    
    if (!categoriesResponse.data.success) {
      throw new Error('Failed to fetch categories');
    }
    
    categories = categoriesResponse.data.categories;
    console.log('✅ Categories fetched successfully');
    console.log(`   Found ${categories.length} categories`);

    // Step 3: Seed Products for Each Category
    console.log('\n3️⃣ Seeding products for each category...');
    
    let totalProductsCreated = 0;
    
    for (const category of categories) {
      console.log(`\n📂 Processing category: ${category.name}`);
      
      const productTemplates = PRODUCT_TEMPLATES[category.name];
      if (!productTemplates) {
        console.log(`   ⚠️ No product templates found for category: ${category.name}`);
        continue;
      }
      
      let categoryProductsCreated = 0;
      
      for (const template of productTemplates) {
        try {
          const productData = {
            ...template,
            category: category._id,
            currency: 'NGN'
          };
          
          const productResponse = await axios.post(
            `${CONFIG.BASE_URL}/api/products/admin/create`,
            productData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          
          if (productResponse.data.success) {
            categoryProductsCreated++;
            totalProductsCreated++;
            console.log(`   ✅ Created: ${template.name} (₦${template.price.toLocaleString()})`);
          } else {
            console.log(`   ❌ Failed to create: ${template.name} - ${productResponse.data.message}`);
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.log(`   ❌ Error creating ${template.name}: ${error.message}`);
        }
      }
      
      console.log(`   📊 Category Summary: ${categoryProductsCreated}/${productTemplates.length} products created`);
    }

    // Step 4: Verification
    console.log('\n4️⃣ Verifying seeded products...');
    const verificationResponse = await axios.get(`${CONFIG.BASE_URL}/api/products`);
    
    if (verificationResponse.data.success) {
      const allProducts = verificationResponse.data.products;
      console.log('✅ Product verification completed');
      console.log(`   Total products in system: ${allProducts.length}`);
      
      // Show products by category
      categories.forEach(category => {
        const categoryProducts = allProducts.filter(p => p.category?._id === category._id);
        console.log(`   ${category.name}: ${categoryProducts.length} products`);
      });
    }

    // Success Summary
    console.log('\n🎉 PRODUCT SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(50));
    console.log(`✅ Total products created: ${totalProductsCreated}`);
    console.log(`✅ Categories processed: ${categories.length}`);
    console.log('✅ Product catalog is now ready for shopping!');
    console.log('\n📱 Products are now available in:');
    console.log('   - Mobile app shop listing');
    console.log('   - Web shop page');
    console.log('   - Admin product management');

  } catch (error) {
    console.log('\n💥 PRODUCT SEEDING FAILED!');
    console.log('=' .repeat(50));
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('📱 Response Status:', error.response.status);
      console.error('📱 Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify admin credentials are correct');
    console.log('2. Check server connectivity and API endpoints');
    console.log('3. Ensure product creation permissions are properly configured');
    console.log('4. Verify category IDs are valid');
    
    process.exit(1);
  }
}

// Run the seeding script
seedProducts();
