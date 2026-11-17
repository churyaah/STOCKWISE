import { GoogleGenerativeAI } from '@google/generative-ai';
import { InventoryTransaction, Product, RestockRecommendation, Supplier } from '../types';
import { formatCurrency } from '../utils/formatters';
import { inventoryService } from './inventoryService';

export interface AIAnalysisResult {
  summary: string;
  recommendations: RestockRecommendation[];
  fastMoving: { product: Product; unitsSold: number }[];
  slowMoving: { product: Product; unitsSold: number }[];
  rawAnswer?: string;
}

class GeminiService {
  private getClientKey(): string {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('inv_mgr_gemini_key') || '';
  }

  // Generate deterministic restructuring recommendations directly from real DB records
  calculateRestockRecommendations(products: Product[], suppliers: Supplier[]): RestockRecommendation[] {
    const list: RestockRecommendation[] = [];

    for (const p of products) {
      if (p.current_quantity <= p.reorder_level) {
        const target = p.target_stock_level || p.reorder_level * 3;
        const deficit = Math.max(0, target - p.current_quantity);
        const estCost = deficit * p.purchase_price;
        const supplier = suppliers.find(s => s.id === p.supplier_id);

        let priority: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
        if (p.current_quantity === 0) {
          priority = 'CRITICAL';
        } else if (p.current_quantity <= Math.ceil(p.reorder_level / 2)) {
          priority = 'HIGH';
        }

        list.push({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          currentStock: p.current_quantity,
          reorderLevel: p.reorder_level,
          targetStock: target,
          recommendedOrder: deficit,
          estimatedCost: estCost,
          supplierName: supplier ? supplier.company : 'Unassigned Supplier',
          priority,
        });
      }
    }

    // Sort by priority (CRITICAL -> HIGH -> MODERATE) then deficit
    const order = { CRITICAL: 0, HIGH: 1, MODERATE: 2 };
    return list.sort((a, b) => order[a.priority] - order[b.priority] || b.recommendedOrder - a.recommendedOrder);
  }

  // Calculate product velocity from real transaction ledger
  calculateVelocity(products: Product[], transactions: InventoryTransaction[]): {
    fastMoving: { product: Product; unitsSold: number }[];
    slowMoving: { product: Product; unitsSold: number }[];
  } {
    const salesMap: Record<string, number> = {};

    // Only count 'OUT' transactions
    for (const tx of transactions) {
      if (tx.type === 'OUT') {
        salesMap[tx.product_id] = (salesMap[tx.product_id] || 0) + tx.quantity;
      }
    }

    const scored = products.map(p => ({
      product: p,
      unitsSold: salesMap[p.id] || 0,
    }));

    // Sort descending by units sold
    scored.sort((a, b) => b.unitsSold - a.unitsSold);

    const fastMoving = scored.filter(s => s.unitsSold > 0).slice(0, 5);
    const slowMoving = scored.filter(s => s.unitsSold === 0 || s.unitsSold < 3);

    return { fastMoving, slowMoving };
  }

  // Generate automated executive summary
  async generateExecutiveSummary(): Promise<AIAnalysisResult> {
    const products = await inventoryService.getProducts();
    const suppliers = await inventoryService.getSuppliers();
    const transactions = await inventoryService.getTransactions();
    const stats = await inventoryService.getDashboardStats();

    const recommendations = this.calculateRestockRecommendations(products, suppliers);
    const { fastMoving, slowMoving } = this.calculateVelocity(products, transactions);

    const apiKey = this.getClientKey();
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a high-precision inventory intelligence engine for executive leadership.
Based STRICTLY on this verified database snapshot:
- Total Products: ${stats.totalProducts}
- Total Inventory Valuation: ${formatCurrency(stats.inventoryValuation)}
- Total Stock Units: ${stats.totalStockQuantity}
- Low Stock Items (${recommendations.length}): ${recommendations.map(r => `${r.sku} (${r.productName}): Stock ${r.currentStock}/${r.reorderLevel}, Needs ${r.recommendedOrder} units`).join('; ')}
- Fast Moving Items: ${fastMoving.map(f => `${f.product.sku}: ${f.unitsSold} units`).join(', ') || 'No outgoing sales recorded'}
- Total Recent Transactions: ${transactions.length}

Draft a concise, 3-paragraph executive inventory briefing in an editorial, monochromatic Swiss style.
Paragraph 1: Core inventory health, liquidity, and asset valuation.
Paragraph 2: Stockout risks and priority replenishment actions required.
Paragraph 3: Operational recommendations to optimize turnover.
DO NOT invent or alter any figures.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return {
          summary: text,
          recommendations,
          fastMoving,
          slowMoving,
        };
      } catch (err) {
        console.warn('Gemini API call failed, generating deterministic response:', err);
      }
    }

    // Deterministic High-Precision Fallback (Strictly matches database figures)
    const criticalCount = recommendations.filter(r => r.priority === 'CRITICAL').length;
    const highCount = recommendations.filter(r => r.priority === 'HIGH').length;
    const totalOrderCost = recommendations.reduce((acc, r) => acc + r.estimatedCost, 0);

    const deterministicSummary = `**EXECUTIVE INVENTORY BRIEFING**
Active catalog comprises **${stats.totalProducts} unique SKUs** holding **${stats.totalStockQuantity} total physical units** with a combined cost valuation of **${formatCurrency(stats.inventoryValuation)}**. Overall warehouse liquidity is healthy, though **${stats.lowStockProductsCount} products** are operating below their safety thresholds.

**REPLENISHMENT & RISK PROFILE**
Immediate attention is required for **${stats.outOfStockCount} zero-stock items** and **${criticalCount + highCount} critical replenishment lines**. Total estimated procurement expenditure to restore all depleted SKUs to their target baseline is **${formatCurrency(totalOrderCost)}**. Primary procurement priority is concentrated with **${recommendations[0]?.supplierName || 'primary vendors'}**.

**VELOCITY OBSERVATION**
Leading throughput is registered by **${fastMoving[0]?.product.name || 'catalog staples'}** (${fastMoving[0]?.unitsSold || 0} units dispensed). Conversely, **${slowMoving.length} catalog items** show muted movement over the observed ledger window, suggesting potential allocation shifts for storage optimization.`;

    return {
      summary: deterministicSummary,
      recommendations,
      fastMoving,
      slowMoving,
    };
  }

  // Answer user queries via Chat
  async askInventoryAssistant(userQuery: string, chatHistory: { role: string; content: string }[]): Promise<string> {
    const products = await inventoryService.getProducts();
    const suppliers = await inventoryService.getSuppliers();
    const transactions = await inventoryService.getTransactions();
    const stats = await inventoryService.getDashboardStats();
    const recommendations = this.calculateRestockRecommendations(products, suppliers);
    const { fastMoving, slowMoving } = this.calculateVelocity(products, transactions);

    const apiKey = this.getClientKey();
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemContext = `You are INVENTORY INTELLIGENCE AI, an expert, objective assistant.
You have DIRECT, REAL-TIME access to the company's verified inventory database:
- Total Products: ${stats.totalProducts}
- Total Units in Stock: ${stats.totalStockQuantity}
- Total Valuation: ${formatCurrency(stats.inventoryValuation)}
- Low Stock Items: ${recommendations.length} (${recommendations.map(r => `${r.sku}: stock ${r.currentStock}, reorder ${r.reorderLevel}`).join(', ')})
- Out of Stock Items: ${products.filter(p => p.current_quantity === 0).map(p => p.sku).join(', ') || 'None'}
- Top Moving: ${fastMoving.map(f => `${f.product.sku} (${f.unitsSold} units)`).join(', ') || 'None'}
- Recent 10 Transactions: ${transactions.slice(0, 10).map(t => `${t.type} ${t.quantity}x of ${t.product_id} on ${t.transaction_date}`).join('; ')}

RULES:
1. Always give exact, deterministic numbers from the data.
2. If the user asks about a specific product, check this list: ${products.map(p => `${p.name} (SKU: ${p.sku}, Qty: ${p.current_quantity}, Cost: $${p.purchase_price}, Price: $${p.selling_price})`).join('; ')}.
3. Maintain a crisp, professional, monochromatic tone.
4. If asked to perform an action (e.g. change stock), inform the user that you are read-only and guide them to the Stock In / Stock Out workflow.`;

        const chat = model.startChat({
          history: chatHistory.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
        });

        const promptWithContext = `${systemContext}\n\nUser Question: ${userQuery}`;
        const response = await chat.sendMessage(promptWithContext);
        return response.response.text();
      } catch (err) {
        console.warn('Gemini chat API error, falling back to deterministic responder:', err);
      }
    }

    // Deterministic Natural Language Engine (handles core queries instantly & accurately)
    const q = userQuery.toLowerCase();

    if (q.includes('restock') || q.includes('reorder') || q.includes('low stock')) {
      if (recommendations.length === 0) {
        return 'All products currently meet or exceed their reorder thresholds. No immediate restocking is required.';
      }
      const lines = recommendations.map(
        r => `• **${r.sku}** (${r.productName}): Current stock is **${r.currentStock} units** (Reorder level: ${r.reorderLevel}). Recommended replenishment: **+${r.recommendedOrder} units** from ${r.supplierName} (Est. cost: ${formatCurrency(r.estimatedCost)}).`
      );
      return `### Restocking Analysis\nFound **${recommendations.length} product(s)** needing replenishment:\n\n${lines.join('\n\n')}\n\n*Total procurement capital needed: ${formatCurrency(recommendations.reduce((a, b) => a + b.estimatedCost, 0))}*`;
    }

    if (q.includes('value') || q.includes('worth') || q.includes('valuation')) {
      const byCat: Record<string, number> = {};
      products.forEach(p => {
        byCat[p.category] = (byCat[p.category] || 0) + p.current_quantity * p.purchase_price;
      });
      const catBreakdown = Object.entries(byCat)
        .map(([cat, val]) => `• **${cat}**: ${formatCurrency(val)} (${((val / stats.inventoryValuation) * 100).toFixed(1)}%)`)
        .join('\n');

      return `### Inventory Valuation\nTotal inventory valuation at cost: **${formatCurrency(stats.inventoryValuation)}** across **${stats.totalStockQuantity} total units**.\n\n**Category Breakdown:**\n${catBreakdown}`;
    }

    if (q.includes('fast') || q.includes('top selling') || q.includes('moving')) {
      if (!fastMoving.length) {
        return 'There are currently no recorded outbound sales transactions to measure velocity.';
      }
      const list = fastMoving.map(
        (f, i) => `${i + 1}. **${f.product.sku}** (${f.product.name}): **${f.unitsSold} units dispatched**.`
      );
      return `### Fast-Moving Products\nTop items ranked by outbound volume:\n\n${list.join('\n')}`;
    }

    if (q.includes('supplier') || q.includes('vendor')) {
      return `### Registered Suppliers\nCurrently managing **${suppliers.length} active suppliers**:\n\n${suppliers.map(s => `• **${s.company}** (${s.name}) — ${s.email} | ${s.phone}`).join('\n')}`;
    }

    if (q.includes('summary') || q.includes('overview') || q.includes('status')) {
      return `### Inventory Overview\n• **Catalog Products:** ${stats.totalProducts} items\n• **Total Units in Stock:** ${stats.totalStockQuantity} units\n• **Total Valuation (Cost):** ${formatCurrency(stats.inventoryValuation)}\n• **Optimal Stock:** ${stats.inStockCount} items\n• **Low Stock Alerts:** ${stats.lowStockProductsCount} items\n• **Stockouts:** ${stats.outOfStockCount} items\n• **Total Recorded Transactions:** ${transactions.length}`;
    }

    // Product search inside query
    const matchedProduct = products.find(
      p => q.includes(p.sku.toLowerCase()) || q.includes(p.name.toLowerCase())
    );

    if (matchedProduct) {
      return `### Product Intelligence: ${matchedProduct.name} (${matchedProduct.sku})
- **Category:** ${matchedProduct.category}
- **Current Quantity:** ${matchedProduct.current_quantity} units
- **Status:** ${matchedProduct.current_quantity === 0 ? 'OUT OF STOCK' : matchedProduct.current_quantity <= matchedProduct.reorder_level ? 'LOW STOCK' : 'IN STOCK'}
- **Reorder Level:** ${matchedProduct.reorder_level} units
- **Target Stock:** ${matchedProduct.target_stock_level} units
- **Cost Price:** ${formatCurrency(matchedProduct.purchase_price)}
- **Selling Price:** ${formatCurrency(matchedProduct.selling_price)}
- **Inventory Value:** ${formatCurrency(matchedProduct.current_quantity * matchedProduct.purchase_price)}`;
    }

    return `I analyzed your inquiry against current warehouse records:
- **Total Catalog:** ${stats.totalProducts} items
- **Current Stock Units:** ${stats.totalStockQuantity}
- **Inventory Valuation:** ${formatCurrency(stats.inventoryValuation)}
- **Depleted / Low Stock:** ${stats.lowStockProductsCount + stats.outOfStockCount} items

You can ask me specific questions like:
- "Which products need restocking?"
- "What is my current inventory valuation?"
- "Show fast-moving products"
- "Give me details on SKU SEN-LIDAR-002"
- "Summarize this month's stock movements"`;
  }
}

export const geminiService = new GeminiService();
