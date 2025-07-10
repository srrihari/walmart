import express from "express";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import axios from "axios";

config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("Supabase environment variables are missing!");
  process.exit(1);
}

const app = express();
const port = 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.send(`Server Running...`);
});

// app.get("/electronics", async (req, res) => {
//   const { data, error } = await supabase.from("Electronics").select("*");

//   return res.json(data);
// });

app.get("/electronics", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase.from("Electronics").select("*").not("price", "is", null);

  if (id) {
    query = query.eq("id", id);
  } else {
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    if (category) {
      query = query.eq("category", category);
    }
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({ data });
});

app.get("/foodgroceries", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase
    .from("Groceries")
    .select("*", { count: "exact" })
    .not("price", "is", null);

  if (id) {
    // Fetch single product by ID
    query = query.eq("id", id);
    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data, total: count });
  }

  const from = (page - 1) * limit;
  const to = from + parseInt(limit) - 1;

  if (category) {
    query = query.eq("category", category);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({ data, total: count });
});

app.get("/household", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase.from("Household").select("*").not("price", "is", null);

  if (id) {
    query = query.eq("id", id);
  } else {
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    if (category) {
      query = query.eq("category", category);
    }
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get("/bodycarediet", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase
    .from("body_care_diet")
    .select("*", { count: "exact" })
    .not("price", "is", null);

  if (id) {
    // If fetching a specific product by ID
    query = query.eq("id", id);
    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data, total: count });
  }

  const from = (page - 1) * limit;
  const to = from + parseInt(limit) - 1;

  if (category) {
    query = query.eq("category", category);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({ data, total: count });
});

app.get("/cloth", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase
    .from("cloth_accessories")
    .select("*")
    .not("price", "is", null); // Filter out null prices

  if (id) {
    query = query.eq("id", id);
  } else {
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    if (category) {
      query = query.eq("category", category);
    }
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({ data });
});

app.get("/pet", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase.from("pet").select("*").not("price", "is", null);

  if (id) {
    query = query.eq("id", id);
  } else {
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    if (category) {
      query = query.eq("category", category);
    }
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get("/schoolutensils", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase
    .from("school_utensils")
    .select("*")
    .not("price", "is", null);

  if (id) {
    query = query.eq("id", id);
  } else {
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    if (category) {
      query = query.eq("category", category);
    }
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get("/vehiclecare", async (req, res) => {
  const { page = 1, limit = 100, category, id } = req.query;

  let query = supabase
    .from("Vehicle_care")
    .select("*")
    .not("price", "is", null);

  if (id) {
    query = query.eq("id", id);
  } else {
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    if (category) {
      query = query.eq("category", category);
    }
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    location,
    fav_category, // expects comma-separated string
  } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from("Users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "User Exists" });
    }

    // Insert new user
    const { data, error } = await supabase.from("Users").insert([
      {
        name,
        email,
        password,
        age,
        gender,
        location,
        fav_category, // stored as comma-separated string
      },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "User Registered", user: data });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("email", email);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No user Found" });
    }

    const user = data[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    return res.status(200).json({
      message: "Login Success",
      user: user, // ✅ Return full user object
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.put("/user/budget", async (req, res) => {
  const { id, budget } = req.body;

  try {
    const { data, error } = await supabase
      .from("Users")
      .update({ budget })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: "Budget updated", user: data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update budget" });
  }
});

app.post("/cart/add", async (req, res) => {
  const { user_id, category, product_id, quantity } = req.body;

  try {
    const { error } = await supabase
      .from("cartitems")
      .insert([{ user_id, category, product_id, quantity }]);

    if (error) throw error;

    res.status(200).json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

const allowedCategories = [
  "Electronics",
  "Groceries",
  "Household",
  "body_care_diet",
  "cloth_accessories",
  "pet",
  "school_utensils",
  "Vehicle_care",
];

app.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("cartitems")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ error: "Error fetching cart" });
  }
});

app.delete("/cart/:cartItemId", async (req, res) => {
  const cartItemId = parseInt(req.params.cartItemId, 10);

  try {
    const { data, error } = await supabase
      .from("cartitems")
      .delete()
      .eq("id", cartItemId) // now matches correctly
      .select(); // log what was deleted

    if (error) throw error;

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.post("/checkout/:userId", async (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // 1. Insert into purchase table
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchase")
    .insert([
      {
        u_id: userId,
        total_amount: totalAmount,
        purchase_date: new Date().toISOString().split("T")[0],
      },
    ])
    .select()
    .single();

  if (purchaseError) {
    console.error("Error inserting purchase:", purchaseError);
    return res.status(500).json({ error: "Failed to create purchase." });
  }

  const p_id = purchase.p_id;

  // 2. Insert into purchase_items
  const purchaseItems = items.map((item) => ({
    p_id,
    product_id: item.product_id,
    category: item.category,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.quantity * item.price,
  }));

  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(purchaseItems);

  if (itemsError) {
    console.error("Error inserting purchase items:", itemsError);
    return res.status(500).json({ error: "Failed to insert purchase items." });
  }

  // 3. Clear cart
  const { error: clearError } = await supabase
    .from("cartitems")
    .delete()
    .eq("user_id", userId);

  if (clearError) {
    console.error("Error clearing cart:", clearError);
  }

  return res.status(200).json({ message: "Checkout successful." });
});

app.get("/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  const categoryMap = {
    electronics: "Electronics",
    foodgroceries: "Groceries",
    bodycarediet: "body_care_diet",
    household: "Household",
    cloth: "cloth_accessories",
    schoolutensils: "school_utensils",
    pet: "pet",
    vehiclecare: "Vehicle_care",
  };

  try {
    // Step 1: Get all purchases for the user
    const { data: purchases, error: purchaseError } = await supabase
      .from("purchase")
      .select("*")
      .eq("u_id", userId)
      .order("purchase_date", { ascending: false });

    if (purchaseError) throw purchaseError;

    // Step 2: For each purchase, fetch the related items
    const ordersWithItems = await Promise.all(
      purchases.map(async (purchase) => {
        const { data: items, error: itemsError } = await supabase
          .from("purchase_items")
          .select("*")
          .eq("p_id", purchase.p_id);

        if (itemsError) throw itemsError;

        // Step 3: Enrich each item with product info from the correct category table
        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const tableName = categoryMap[item.category?.toLowerCase()];
              if (!tableName) {
                console.warn("⚠️ No table found for category:", item.category);
                return item;
              }

              const { data: productData, error: prodErr } = await supabase
                .from(tableName)
                .select("image_url, name, rating, reviews")
                .eq("id", item.product_id)
                .single();

              if (prodErr) {
                console.error(
                  "❌ Product fetch error from",
                  tableName,
                  "| Error:",
                  prodErr
                );
              }

              if (!productData) {
                console.warn(
                  "⚠️ No product found in",
                  tableName,
                  "for product_id:",
                  item.product_id
                );
                return item;
              }

              return {
                ...item,
                image: productData.image_url,
                product_name: productData.name,
                rating: productData.rating,
                reviews: productData.reviews,
              };
            } catch (err) {
              console.error("❌ Failed to enrich item:", item, "| Error:", err);
              return item;
            }
          })
        );

        return {
          ...purchase,
          items: enrichedItems,
        };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

const VALID_CATEGORIES = [
  "Electronics",
  "Foods & Groceries",
  "Clothing, Handbags, Watches & Accessories",
  "Body Care & Diet",
  "Pets",
  "Groceries",
  "Household",
  "Vehicle Care",
  "School Utensils",
];

const categoryMap = {
  Electronics: "Electronics",
  Groceries: "Groceries",
  body_care_diet: "Body Care & Diet",
  Household: "Household",
  cloth_accessories: "Clothing, Handbags, Watches & Accessories",
  school_utensils: "School Utensils",
  pet: "Pets",
  Vehicle_care: "Vehicle Care",
};

// 2. Reverse the map for lookup
const tableLookup = Object.entries(categoryMap).reduce(
  (acc, [table, displayName]) => {
    acc[displayName] = table;
    return acc;
  },
  {}
);

app.get("/recommend", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // 3. Get fav_category for the user
    const { data: userData, error } = await supabase
      .from("Users")
      .select("fav_category")
      .eq("id", userId)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const favStr = userData.fav_category || "";

    // 4. Match categories from the predefined list
    const VALID_CATEGORIES = Object.values(categoryMap);
    const matchedCategories = VALID_CATEGORIES.filter((cat) =>
      favStr.includes(cat)
    );

    // 5. Get corresponding table names
    const tablesToQuery = matchedCategories
      .map((cat) => tableLookup[cat])
      .filter(Boolean);

    // 6. Fetch data from each category table
    const results = {};

    for (const table of tablesToQuery) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(4)
        .not("price", "is", null);
      if (error) {
        console.error(`Error fetching from ${table}:`, error.message);
        continue;
      }
      results[table] = data;
    }

    // 7. Send all fetched items grouped by table
    res.json({ recommended: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/product/:category/:id", async (req, res) => {
  const { category, id } = req.params;

  // Sanitize allowed table names to prevent SQL injection
  const allowedCategories = [
    "Electronics",
    "pet",
    "Household",
    "Groceries",
    "cloth_accessories",
    "Vehicle_care",
    "school_utensils",
    "body_care_diet",
  ];

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const { data, error } = await supabase
    .from(category)
    .select("*")
    .eq("id", id)
    .single(); // get a single item

  if (error || !data) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(data);
});

app.post("/create-family", async (req, res) => {
  const { userId, budget } = req.body;

  // 1. Create new family
  const { data: familyData, error: familyError } = await supabase
    .from("Family")
    .insert([{ u_id: userId, total_budget: budget, total_spent: 0 }])
    .select()
    .single();

  if (familyError) return res.status(400).json({ error: familyError.message });

  // 2. Update user with f_id and f_role = 'head'
  const { error: userError } = await supabase
    .from("Users")
    .update({ f_id: familyData.f_id, f_role: "head" })
    .eq("id", userId);

  if (userError) return res.status(400).json({ error: userError.message });

  res.status(200).json({ message: "Family created", f_id: familyData.f_id });
});

// In your Express backend
app.post("/join-family", async (req, res) => {
  const { userId, f_id } = req.body;

  try {
    // 1. Check if the family exists
    const { data: family, error: familyError } = await supabase
      .from("Family")
      .select("*")
      .eq("f_id", f_id)
      .single();

    if (familyError || !family) {
      return res
        .status(400)
        .json({ success: false, message: "Family not found" });
    }

    // 2. Update the user to join this family
    const { error: updateError } = await supabase
      .from("Users")
      .update({
        f_id,
        f_role: "member",
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error joining family" });
  }
});

// GET /family-members/:f_id
app.get("/family-members/:f_id", async (req, res) => {
  const { f_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("Users")
      .select("*") // adjust fields as needed
      .eq("f_id", f_id);

    if (error) throw error;

    res.json({ success: true, members: data });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch members" });
  }
});

app.post("/exit-family", async (req, res) => {
  const { userId } = req.body;

  try {
    // Fetch user to get current family ID and role
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("f_id, f_role")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const { f_id, f_role } = userData;

    if (!f_id) {
      return res
        .status(400)
        .json({ success: false, message: "User is not part of any family" });
    }

    // If user is head, prevent exiting or transfer head role logic here
    if (f_role === "head") {
      return res.status(403).json({
        success: false,
        message:
          "Family head cannot exit. Please transfer ownership or delete the family.",
      });
    }

    // Remove user from family by updating f_id and f_role
    const { error: updateError } = await supabase
      .from("Users")
      .update({ f_id: null, f_role: null })
      .eq("id", userId);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Exited family successfully" });
  } catch (err) {
    console.error("Exit family error:", err);
    res.status(500).json({ success: false, message: "Failed to exit family" });
  }
});

app.listen(port);
