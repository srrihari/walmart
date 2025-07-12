import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import path from "path";
import { Groq } from "groq-sdk";
import { SarvamAIClient } from "sarvamai";
import { fileURLToPath } from "url";
import multer from "multer";
import wavConcat from "wav-concat";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config(); // ✅ Loads .env variables
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

globalThis.fetch = fetch;
globalThis.FormData = FormData;

ffmpeg.setFfmpegPath(ffmpegPath);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // ⚠️ Don't hardcode in production
});
const GROQ_API_KEY = process.env.GROQ_API_KEY; // ⚠️ WARNING: For demo only!

const sarvamClient = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY, // ✅ Replace this with your real key
});
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `${inputPath}.wav`;

    // 🎯 Convert uploaded audio to WAV using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("wav")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    console.log("✅ Converted to WAV:", outputPath);

    // 🧠 Use raw fetch instead of broken SDK
    const form = new FormData();
    form.append("file", fs.createReadStream(outputPath), {
      filename: "converted.wav",
      contentType: "audio/wav",
    });
    form.append("language_code", "en-IN");
    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ STT failed:", response.status, errText);
      return res.status(500).json({ error: "STT failed", detail: errText });
    }

    const result = await response.json();
    console.log("✅ Full STT Response:", result);

    const transcription = result?.transcript || "Transcription not found";
    console.log("✅ Transcription:", transcription);

    res.json({ transcription });

    // 🧹 Cleanup
    fs.unlink(inputPath, () => {});
    fs.unlink(outputPath, () => {});
  } catch (err) {
    console.error("❌ Transcription Error:", err.message);
    res
      .status(500)
      .json({ error: "Transcription failed", detail: err.message });
  }
});
app.post("/tts", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text is required for TTS." });
  }

  const CHUNK_SIZE = 300;
  const splitText = (str) => {
    const chunks = [];
    let remaining = str.trim();
    while (remaining.length > 0) {
      let chunk = remaining.slice(0, CHUNK_SIZE);
      const lastPeriod = chunk.lastIndexOf(".");
      if (lastPeriod > 100) chunk = chunk.slice(0, lastPeriod + 1);
      chunks.push(chunk.trim());
      remaining = remaining.slice(chunk.length).trim();
    }
    return chunks;
  };

  try {
    const chunks = splitText(text);
    const audioPaths = [];

    for (let i = 0; i < chunks.length; i++) {
      const response = await sarvamClient.textToSpeech.convert({
        text: chunks[i],
        model: "bulbul:v2",
        speaker: "vidya",
        target_language_code: "en-IN",
        pace: "0.7",
      });

      const audioData = response.audios?.[0];
      if (!audioData) throw new Error("No audio returned for chunk");

      const buffer = Buffer.from(audioData, "base64");
      const audioDir = path.join(__dirname, "audios");
      fs.mkdirSync(audioDir, { recursive: true });

      const filePath = path.join(audioDir, `chunk_${i}_${Date.now()}.wav`);
      fs.writeFileSync(filePath, buffer);
      audioPaths.push(filePath);
    }

    // Create concat list file
    const concatListPath = path.join(
      __dirname,
      "audios",
      `list_${Date.now()}.txt`
    );
    const concatListContent = audioPaths.map((p) => `file '${p}'`).join("\n");
    fs.writeFileSync(concatListPath, concatListContent);

    // Merge using ffmpeg
    const outputPath = path.join(
      __dirname,
      "audios",
      `merged_${Date.now()}.wav`
    );
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatListPath)
        .inputOptions("-f", "concat", "-safe", "0")
        .outputOptions("-c", "copy")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    // Cleanup
    setTimeout(() => {
      for (const file of [...audioPaths, concatListPath]) {
        fs.unlink(file, () => {});
      }
    }, 15000);

    res.sendFile(outputPath, () => {
      setTimeout(() => fs.unlink(outputPath, () => {}), 60000);
    });
  } catch (error) {
    console.error("TTS backend error:", error.message);
    res.status(500).json({ error: "TTS failed to process long input." });
  }
});

app.post("/chat", async (req, res) => {
  let prompt = req.body.prompt;
  // const imageUrl = req.body.imageUrl;
  console.log("Prompt:", prompt);
  // console.log("Image URL:", imageUrl);
  try {
    const langDetectRes = await fetch("https://api.sarvam.ai/text-lid", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: prompt }),
    });

    const langData = await langDetectRes.json();
    const detectedLang = langData?.language_code || "en";
    console.log("Detected language:", detectedLang);

    if (detectedLang !== "en-IN") {
      const translateRes = await fetch("https://api.sarvam.ai/translate", {
        method: "POST",
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: prompt,
          source_language_code: detectedLang,
          target_language_code: "en-IN",
        }),
      });

      const translatedData = await translateRes.json();
      prompt = translatedData?.translated_text || prompt;
      console.log("Translated to English:", prompt);
    }
  } catch (err) {
    console.error("Language processing failed:", err.message);
  }
  const system_prompt = `You are a smart meal planner assistant for a grocery shopping app like Walmart.

Your job is to understand any user request related to meal planning and suggest meals accordingly. You can handle:
- single meals (e.g., only dinner for today),
- daily plans (e.g., breakfast/lunch/dinner for tomorrow, for today),
- multi-day plans (e.g., full 3-day or 7-day meal plans),
- dietary preferences (e.g., vegetarian, high protein),
- budget constraints or quick meals.

You must always return your response in the following strict **JSON format**:
{
  "meal_plan": {
    "Day Label (like Today, Monday, Tomorrow)": {
      "Breakfast": "...",  
      "Lunch": "...",      
      "Dinner": "..."      
    },
    ...
  },
  "ingredients": [
    "List of raw ingredients needed for all meals, each as a unique string with no repetition"
  ]
}

Guidelines:
- Return only the meals the user asked for (e.g., if user asks only for dinner, do not return breakfast/lunch).
- Avoid repeating meals already shown earlier (you’ll receive a list of dishes to avoid).
- Choose dishes that are common, simple, affordable, and grocery-store friendly.
- Do NOT return recipes or instructions — just dish names and required ingredients.
- Do NOT include greetings, explanations, or markdown — return only a single raw JSON object.

Strict JSON Rules:
- Do NOT wrap any values in extra quotes (e.g., use "Yogurt Parfait", NOT ""Yogurt Parfait"").
- All keys and values must use standard double quotes (") only.
- Day labels like "Monday", "Tuesday", etc., must not have extra whitespace or quotes.
- Never use backslashes, escaped characters, or any invalid symbols inside keys/values.
- Ensure the output can be parsed using JSON.parse() in JavaScript without error.
- Do NOT return code blocks, markdown, or any trailing text — only a raw JSON object.
- Each ingredient must be a unique, plain string — no nesting or formatting.
- DO NOT include newline characters or line breaks **inside** values.

If the user asks something unrelated to meal planning, respond exactly with:
"Sorry I can't help you with that, I am here to help you with planning your meal."

Example answer:
{
  "meal_plan": {
    "Today": {
      "Dinner": "Grilled Paneer Wrap"
    }
  },
  "ingredients": [
    "Paneer", "Whole Wheat Wrap", "Lettuce", "Onion", "Tomato", "Yogurt"
  ]
}`;

  const userContent = [];

  if (prompt) {
    userContent.push({ type: "text", text: prompt });
  }

  // if (imageUrl) {
  //   userContent.push({ type: "image_url", image_url: { url: imageUrl } });
  // }
  if (userContent.length === 0) {
    return res.status(400).json({ error: "A Prompt is required." });
  }
  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: system_prompt },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    let content = response.choices[0].message.content.trim();

    // Remove Markdown code blocks if present
    if (content.startsWith("```")) {
      content = content
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/```$/, "")
        .trim();
    }

    // Sanitize content before sending it to frontend
    const sanitizeJsonString = (input) => {
      return input
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .replace(/“|”/g, '"') // Replace smart quotes
        .replace(/(\w+)\s*:/g, '"$1":'); // Ensure keys are quoted (use with care)
    };

    let sanitized = sanitizeJsonString(content);

    // Validate JSON
    try {
      const parsed = JSON.parse(sanitized); // ensures it's valid JSON
      return res.json({ message: JSON.stringify(parsed, null, 2) }); // well-formatted
    } catch (err) {
      console.warn("❌ JSON Parse Failed, sending raw string.");
      return res.json({ message: sanitized }); // fallback if still broken
    }
  } catch (err) {
    console.error("Groq API error:", err.message);
    res.status(500).json({
      error:
        err.response?.status === 503
          ? "Service is temporarily unavailable. Please try again shortly."
          : "An unexpected error occurred.",
    });
  }
});
app.post("/api/grocery-search", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: "Invalid ingredients array." });
  }

  try {
    const results = [];

    for (const ing of ingredients) {
      const ingredient = ing.trim().toLowerCase();
      let matchedItem = null;

      // First try: match sub_category exactly
      const { data: subCategoryMatch, error: subError } = await supabase
        .from("Groceries")
        .select("id, image_url, name")
        .eq("sub_category", ingredient)
        .limit(1);

      if (subError) throw subError;

      if (subCategoryMatch && subCategoryMatch.length > 0) {
        matchedItem = subCategoryMatch[0];
      }

      // Second try: fuzzy match with name using ilike
      if (!matchedItem) {
        const { data: fuzzyMatch, error: fuzzyError } = await supabase
          .from("Groceries")
          .select("id, image_url, name")
          .ilike("name", `%${ingredient}%`)
          .limit(1);

        if (fuzzyError) throw fuzzyError;

        if (fuzzyMatch && fuzzyMatch.length > 0) {
          matchedItem = fuzzyMatch[0];
        }
      }

      results.push({
        ingredient: ing,
        product: matchedItem || null,
      });
    }
    console.log(results);

    res.json({ matches: results });
  } catch (err) {
    console.error("Supabase fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch grocery data." });
  }
});

const TABLE_LIST = [
  "Groceries",
  "cloth_accessories",
  "Electronics",
  "body_care_diet",
  "pet",
  "Household",
  "school_utensils",
];
async function fetchAllSubCategories(tableName) {
  const PAGE_SIZE = 1000;
  let from = 0;
  let to = PAGE_SIZE - 1;
  let allRows = [];
  let finished = false;

  while (!finished) {
    const { data, error } = await supabase
      .from(tableName)
      .select("sub_category", { head: false })
      .neq("sub_category", null)
      .range(from, to);

    if (error) {
      console.error("❌ Pagination Fetch Error:", error.message);
      break;
    }

    if (data.length === 0) {
      finished = true;
    } else {
      allRows.push(...data);
      from += PAGE_SIZE;
      to += PAGE_SIZE;
    }
  }

  return allRows;
}

app.post("/product-suggest", async (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt)
    return res.status(400).json({ error: "No prompt provided." });
  console.log("📩 User Prompt:", userPrompt);

  // Step 1: Choose Table
  const tablePrompt = `
You are a product assistant. Choose the best matching table from:
${TABLE_LIST.join(", ")}
User said: "${userPrompt}"
Strictly Return only exact table name or "Unknown".
Return only exact table name from the list above (case-sensitive). Do not add punctuation.`;

  let chosenTable = "Unknown";
  try {
    const tableRes = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "system", content: tablePrompt }],
    });

    chosenTable = tableRes.choices[0].message.content.trim();
    console.log("🔍 Chosen Table:", chosenTable);
  } catch (err) {
    console.error("❌ Groq Table Selection Error:", err.message);
    return res
      .status(500)
      .json({ error: "Table selection failed", detail: err.message });
  }

  if (!TABLE_LIST.includes(chosenTable)) {
    console.warn("⚠️ Table not in list. Received:", chosenTable);
    return res.status(400).json({ error: "No valid table match." });
  }

  // Step 2: Get Categories
  console.log("📥 Fetching categories from table:", chosenTable);
  const categoriesData = await fetchAllSubCategories(chosenTable);
  console.log("📊 Total Fetched Subcategories:", categoriesData.length);
  if (!categoriesData || categoriesData.length === 0) {
    console.error("❌ No categories fetched.");
    return res.status(500).json({ error: "No categories found" });
  }

  const categoryList = [
    ...new Set(
      categoriesData
        .map((row) => row.sub_category?.trim().toLowerCase())
        .filter((val) => !!val)
    ),
  ];
  console.log("📦 Available Categories:", categoryList);

  // Step 3: Extract JSON
  const includeSize = chosenTable === "cloth_accessories";
  const extractPrompt = `
You are a smart product filter extractor.
User query: "${userPrompt}"
Available categories:
${categoryList.map((c) => `- ${c}`).join("\n")}

Return this JSON:
{
  "source_table": "${chosenTable}",
  "sub_category": "exact match from list above or null",
  "color": "if mentioned, else null",
  "brand": "if mentioned, else null",
  "budget": "if mentioned (numeric), else null",
  "min_rating": "if mentioned (numeric) or implied (e.g., 'very good' = 4, 'excellent' or 'best' = 4.5+), else null"${
    includeSize ? ',\n  "size": "if mentioned, else null"' : ""
  }
}
  Do not guess similar categories (e.g., "men's clothing"). Match exactly.
  Respond ONLY with clean JSON. Do not add explanations or markdown.`;

  try {
    const extractRes = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "system", content: extractPrompt }],
    });

    let content = extractRes.choices[0].message.content.trim();
    console.log("🧾 Groq Raw Extract:", content);

    content = content.replace(/```json|```/g, "");
    const firstClosingBrace = content.indexOf("}") + 1;
    const jsonString = content.slice(0, firstClosingBrace);
    const parsed = JSON.parse(jsonString);
    parsed.table = chosenTable;

    if (!parsed.sub_category || !categoryList.includes(parsed.sub_category)) {
      console.warn("⚠️ Groq returned unknown category. Applying fallback.");
      parsed.sub_category = categoryList[0] || null;
    }

    console.log("✅ Final Parsed JSON:", parsed);
    return res.json({ parsed });
  } catch (err) {
    console.error("❌ JSON Parse Error:", err.message);
    return res
      .status(500)
      .json({ error: "Parsing failed", detail: err.message });
  }
});

app.post("/api/product-search", async (req, res) => {
  const {
    table: table_name,
    sub_category,
    budget,
    color,
    brand,
    min_rating,
    size,
  } = req.body;

  console.log("📥 Product Search Input:", {
    table_name,
    sub_category,
    budget,
    color,
    brand,
  });

  if (!table_name || !sub_category) {
    console.warn("⚠️ Missing table or category.");
    return res.status(400).json({ error: "Missing table or category" });
  }

  const TABLE_SCHEMAS = {
    Groceries: ["sub_category"],
    cloth_accessories: ["sub_category", "color", "size"],
    Electronics: ["sub_category"],
    body_care_diet: ["sub_category", "color"],
    pet: ["sub_category"],
    Household: ["sub_category"],
    school_utensils: ["sub_category"],
  };

  const allowed = TABLE_SCHEMAS[table_name] || [];

  try {
    console.log("🧪 Executing Supabase Query with:");
    console.log("➡️ Subcategory:", sub_category);
    console.log("➡️ Budget:", budget);
    console.log("➡️ Color:", color);
    console.log("➡️ Brand:", brand);
    console.log("➡️ rating:", min_rating);
    console.log("➡️ size:", size);

    let query = supabase
      .from(table_name)
      .select("*")
      .ilike("sub_category", `%${sub_category.trim().toLowerCase()}%`);
    if (budget) {
      query = query.lte("price", budget); // ✅ UPDATED: price is double precision
    }
    if (color && allowed.includes("color")) {
      query = query.ilike("color", `%${color.trim().toLowerCase()}%`); // ✅ UPDATED
    }
    if (min_rating !== null && !isNaN(min_rating)) {
      query = query.gte("rating", parseFloat(min_rating));
    }

    if (size && allowed.includes("size")) {
      query = query.ilike("size", `%${size.trim().toLowerCase()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("❌ Supabase Fetch Error:", error.message);
      return res.status(500).json({ error: "Supabase fetch error" }); // ✅ UPDATED
    }

    const filtered = (data || []).filter((item) =>
      brand ? item.name.toLowerCase().includes(brand.toLowerCase()) : true
    );
    const results = filtered.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url,
      sub_category: item.sub_category,
    }));
    console.log(
      "🆔 Product IDs:",
      results.map((item) => item.id)
    );
    console.log("✅ Fetched Products:", results.length);
    res.json({ results, matched: { table: table_name } });
  } catch (err) {
    console.error("❌ Supabase Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
const chatHistoryMap = {}; // { productId: [ {role: 'user', content}, {role: 'assistant', content}, ... ] }

app.post("/product-chat", async (req, res) => {
  const { productId, tableName, question } = req.body;
  if (!productId || !question) {
    return res
      .status(400)
      .json({ error: "Product ID and question are required." });
  }

  try {
    // Fetch product

    const { data: product, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", productId)
      .single();
    if (error || !product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Prepare system prompt
    const system_prompt = `You are a product assistant bot. Answer ONLY based on the following product details.

Name: ${product.name}
Description: ${product.description}
Category: ${product.category}
Sub-category: ${product["sub-category"]}
Price: ₹${product.price}
Rating: ${product.rating}


If the user asks anything not covered above, reply with:
"I'm sorry, I don't have that information."`;

    // Get chat history or initialize
    if (!chatHistoryMap[productId]) {
      chatHistoryMap[productId] = [{ role: "system", content: system_prompt }];
    }

    chatHistoryMap[productId].push({ role: "user", content: question });

    // Generate answer using Groq
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: chatHistoryMap[productId],
    });

    const botReply = response.choices[0].message.content.trim();
    chatHistoryMap[productId].push({ role: "assistant", content: botReply });

    res.json({ answer: botReply, history: chatHistoryMap[productId].slice(1) }); // exclude system prompt
  } catch (err) {
    console.error("❌ Product bot error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/shop", async (req, res) => {
  const { prompt, imageUrl } = req.body;

  console.log("🔎 Incoming /shop request:", { prompt, imageUrl });

  if (!imageUrl && !prompt) {
    console.warn("⚠️ No prompt or image provided.");
    return res.status(400).json({ error: "Image and/or prompt required." });
  }

  // Step 1: Determine product category and table
  const groq1_prompt = `
    You are a shopping assistant. Given an image and optional text, identify the relevant product category and match it to the correct database table.

    Available tables:
    - Electronics
    - Groceries
    - Vehicle_care
    - body_care_diet
    - pet
    - cloth_accessories
    - school_utensils
    - Household

    Example:
    If the prompt says "HP laptop" and image has a laptop, respond like:
    {
      "category": "laptop",
      "product_table": "Electronics"
    }

    Return JSON only. User Query: "${prompt || "Refer to image only"}"
  `;

  const content = [];
  if (prompt) content.push({ type: "text", text: prompt });
  if (imageUrl)
    content.push({ type: "image_url", image_url: { url: imageUrl } });

  let parsed;
  try {
    const tableResponse = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: groq1_prompt },
        { role: "user", content },
      ],
    });

    parsed = JSON.parse(tableResponse.choices[0].message.content.trim());
    console.log("✅ Step 1 - Category & Table Identified:", parsed);
  } catch (e) {
    console.error("❌ Groq parsing failed in step 1:", e.message);
    return res
      .status(500)
      .json({ error: "Failed to determine product category/table." });
  }

  const { category, product_table } = parsed;

  // Step 2: Fetch all subcategories
  const { data: rawSubcats, error: subErr } = await supabase
    .from(product_table)
    .select("sub_category");

  if (subErr || !rawSubcats || rawSubcats.length === 0) {
    console.error("❌ Step 2 - Subcategory fetch failed:", subErr);
    return res.status(404).json({ error: "No subcategories found." });
  }

  const subcategories = [
    ...new Set(rawSubcats.map((item) => item.sub_category).filter(Boolean)),
  ];

  console.log("✅ Step 2 - Subcategories fetched:", subcategories);

  // Step 3: Match best subcategory
  const groq2_prompt = `
    Given the product category "${category}", choose the best-matching subcategory from this list:

    ${JSON.stringify(subcategories)}

    Respond in JSON as:
    {
      "sub_category": "best match",
      "product_table": "${product_table}"
    }
    Important-
    Respond ONLY with JSON. Do not include any explanation or text before or after the JSON object.

  `;

  let sub_category;
  try {
    const subcatResponse = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: groq2_prompt },
        { role: "user", content: [{ type: "text", text: prompt || "" }] },
      ],
    });

    const subParsed = JSON.parse(
      subcatResponse.choices[0].message.content.trim()
    );
    sub_category = subParsed.sub_category;
    console.log("✅ Step 3 - Best-matching subcategory:", sub_category);
  } catch (e) {
    console.error("❌ Groq subcategory detection failed:", e.message);
    return res.status(500).json({ error: "Failed to determine subcategory." });
  }

  // Step 4: Build initial query
  let query = supabase
    .from(product_table)
    .select("*")
    .eq("sub_category", sub_category);

  let brandNotFound = false;
  let colorNotFound = false;

  // Step 5A: If Electronics, extract brand
  if (product_table === "Electronics" && prompt) {
    const brandPrompt = `
      Extract the brand name (e.g., HP, Dell, Logitech) from:
      "${prompt}"
      Respond as JSON:
      { "brand": "Logitech" } or { "brand": null }
    `;

    try {
      const brandResponse = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: brandPrompt },
          { role: "user", content: [{ type: "text", text: prompt }] },
        ],
      });

      const { brand } = JSON.parse(
        brandResponse.choices[0].message.content.trim()
      );
      console.log("🛠️ Extracted Brand:", brand);

      if (brand) {
        const { data: allElectronics } = await query;

        const fuzzyMatched = allElectronics.filter((item) =>
          item.name.toLowerCase().includes(brand.toLowerCase())
        );

        if (fuzzyMatched.length > 0) {
          console.log(
            `✅ Fuzzy match for brand '${brand}':`,
            fuzzyMatched.length,
            "items"
          );
          return res.json({
            source: { image: imageUrl, userPrompt: prompt },
            matched: { table: product_table, sub_category },
            results: fuzzyMatched,
          });
        } else {
          console.warn(
            `⚠️ No match found for brand '${brand}', returning all instead`
          );
          brandNotFound = true;
        }
      }
    } catch (err) {
      console.warn("⚠️ Brand extraction failed:", err.message);
    }
  }

  // Step 5B: If cloth, extract color & size
  if (product_table === "cloth_accessories" && prompt) {
    const colorSizePrompt = `
      Extract color and size from:
      "${prompt}"

      Colors can be "Blue", "Sky Blue", "Red", etc. (Check against comma-separated colors)
      Sizes can be: "S", "M", "L", "XL", "XXL"

      Respond in JSON like:
      {
        "color": "Blue" or null,
        "size": "L" or null
      }
    `;

    try {
      const attrResponse = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: colorSizePrompt },
          { role: "user", content: [{ type: "text", text: prompt }] },
        ],
      });

      const { color, size } = JSON.parse(
        attrResponse.choices[0].message.content.trim()
      );

      console.log("🧵 Extracted Clothing Attributes:", { color, size });

      if (color) query = query.ilike("color", `%${color}%`);
      if (size) query = query.ilike("size", `%${size}%`);

      // Run query with filters
      const { data: filteredClothing } = await query;

      if (!filteredClothing || filteredClothing.length === 0) {
        console.warn("⚠️ No clothing items matched filters, sending fallback");
        colorNotFound = true;
        query = supabase
          .from(product_table)
          .select("*")
          .eq("sub_category", sub_category);
      } else {
        return res.json({
          source: { image: imageUrl, userPrompt: prompt },
          matched: { table: product_table, sub_category },
          results: filteredClothing,
        });
      }
    } catch (err) {
      console.warn("⚠️ Color/Size extraction failed:", err.message);
    }
  }

  // Step 6: Fallback query
  const { data: products, error: prodErr } = await query;

  if (prodErr) {
    console.error("❌ Product fetch failed:", prodErr);
    return res.status(500).json({ error: "Product fetch failed." });
  }

  if (!products || products.length === 0) {
    console.warn("❌ No products found even after fallback.");
    return res.status(404).json({ error: "No products found." });
  }

  console.log("✅ Final result count:", products.length);

  res.json({
    source: { image: imageUrl, userPrompt: prompt },
    matched: { table: product_table, sub_category },
    results: products,
    warning: brandNotFound
      ? "This brand was not found, showing similar products."
      : colorNotFound
      ? "This color was not found, showing similar products."
      : null,
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
