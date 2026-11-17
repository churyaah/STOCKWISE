// Supabase Edge Function: inventory-ai
// Secure backend gateway to Google Gemini with deterministic PostgreSQL context injection
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, mode = "chat", contextFilter } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY environment variable is not configured on the server.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Deterministic Data Retrieval from Supabase
    let inventoryContext = "";
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const [productsRes, transactionsRes, suppliersRes] = await Promise.all([
        supabase.from("products").select("id, name, sku, category, purchase_price, selling_price, current_quantity, reorder_level, target_stock_level"),
        supabase.from("inventory_transactions").select("type, quantity, reason, transaction_date, product_id, reference_number").order("transaction_date", { ascending: false }).limit(25),
        supabase.from("suppliers").select("id, name, company, email, phone")
      ]);

      const products = productsRes.data || [];
      const transactions = transactionsRes.data || [];
      const suppliers = suppliersRes.data || [];

      // Calculate deterministic metrics
      const totalProducts = products.length;
      const totalUnits = products.reduce((acc, p) => acc + (p.current_quantity || 0), 0);
      const totalValuation = products.reduce((acc, p) => acc + (p.current_quantity || 0) * Number(p.purchase_price || 0), 0);
      const lowStockProducts = products.filter(p => p.current_quantity > 0 && p.current_quantity <= p.reorder_level);
      const outOfStockProducts = products.filter(p => p.current_quantity === 0);

      inventoryContext = `
REAL-TIME INVENTORY DATABASE SNAPSHOT:
Total Catalog Products: ${totalProducts}
Total Stock Units: ${totalUnits}
Total Inventory Valuation (at cost): $${totalValuation.toFixed(2)}
Out of Stock Products (${outOfStockProducts.length}): ${JSON.stringify(outOfStockProducts.map(p => ({ sku: p.sku, name: p.name, reorder_level: p.reorder_level })))}
Low Stock Alert Products (${lowStockProducts.length}): ${JSON.stringify(lowStockProducts.map(p => ({ sku: p.sku, name: p.name, current: p.current_quantity, reorder_level: p.reorder_level, target: p.target_stock_level })))}
All Products Catalog: ${JSON.stringify(products.map(p => ({ sku: p.sku, name: p.name, category: p.category, stock: p.current_quantity, reorder: p.reorder_level, cost: p.purchase_price, price: p.selling_price })))}
Recent 25 Transactions: ${JSON.stringify(transactions)}
Active Suppliers: ${JSON.stringify(suppliers.map(s => ({ name: s.name, company: s.company })))}
`;
    }

    // 2. Strict Prompt Formulation
    const systemPrompt = `You are the AI Inventory Intelligence Specialist for an enterprise inventory platform.
STRICT GUIDELINES:
1. Always base your numbers strictly and exclusively on the provided database context.
2. NEVER hallucinate or invent inventory quantities, prices, SKUs, or transactions.
3. If requested data is missing, explicitly inform the user that it does not exist in current records.
4. Keep the design aesthetic monochromatic, crisp, professional, and clear.
5. Provide actionable restocking recommendations with exact quantities needed to reach target stock levels.
6. The user query mode is: ${mode}.

${inventoryContext}
`;

    // 3. Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { text: `User Question: ${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for high precision and zero hallucinations
          maxOutputTokens: 1024,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate inventory intelligence response.";

    return new Response(
      JSON.stringify({ reply: replyText, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
