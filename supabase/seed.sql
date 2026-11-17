-- ============================================================================
-- INVENTORY MANAGER SEED DATA
-- Realistic industrial, retail & warehouse dataset
-- ============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'Electronics & Sensors', 'Microcontrollers, sensors, circuits and power components'),
('c1000000-0000-0000-0000-000000000002', 'Mechanical Hardware', 'Precision fasteners, bearings, brackets and extrusions'),
('c1000000-0000-0000-0000-000000000003', 'Raw Materials', 'Industrial grade metals, polymers, and carbon composites'),
('c1000000-0000-0000-0000-000000000004', 'Packaging & Shipping', 'Rigid corrugated boxes, thermal labels, and protective mailers'),
('c1000000-0000-0000-0000-000000000005', 'Safety & PPE', 'Protective eyewear, nitrile gloves, and industrial respirators')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Suppliers
INSERT INTO public.suppliers (id, name, company, email, phone, address, notes) VALUES
('s1000000-0000-0000-0000-000000000001', 'Marcus Vance', 'Apex Micro Precision Ltd', 'vance@apexmicro.com', '+1 (555) 234-8901', '742 Silicon Parkway, San Jose, CA 95134', 'Primary tier-1 provider for optical and sensor chips. Lead time: 5 days.'),
('s1000000-0000-0000-0000-000000000002', 'Elena Rostova', 'Nordic Alloy & Fasteners AB', 'orders@nordicalloy.se', '+46 8 123 4567', 'Industrigatan 14, Gothenburg, Sweden', 'ISO 9001 certified. Stainless and titanium fasteners.'),
('s1000000-0000-0000-0000-000000000003', 'Kenji Takahashi', 'Yamato Polymer Solutions', 'kenji.t@yamatopoly.jp', '+81 3 5555 0192', '3-12-1 Chiyoda, Tokyo 100-0001, Japan', 'Specializes in high-density polyethylene and electrostatic packaging.'),
('s1000000-0000-0000-0000-000000000004', 'David Miller', 'Frontier Logistics Supplies', 'dmiller@frontierpack.com', '+1 (555) 891-2300', '1200 Logistics Blvd, Chicago, IL 60607', 'Contract supplier for custom double-wall shipping containers.')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Products
INSERT INTO public.products (id, name, sku, description, category, purchase_price, selling_price, current_quantity, reorder_level, target_stock_level, supplier_id) VALUES
('p1000000-0000-0000-0000-000000000001', 'Precision LiDAR Sensor Module v2', 'SEN-LIDAR-002', 'High-frequency solid-state optical rangefinder for autonomous systems.', 'Electronics & Sensors', 145.00, 289.00, 4, 15, 60, 's1000000-0000-0000-0000-000000000001'),
('p1000000-0000-0000-0000-000000000002', 'Titanium Hex Cap Screw M6x30mm', 'FAS-TI-M630', 'Grade 5 aerospace titanium fastener pack of 50 units.', 'Mechanical Hardware', 38.50, 72.00, 18, 25, 100, 's1000000-0000-0000-0000-000000000002'),
('p1000000-0000-0000-0000-000000000003', 'Ultra-High-Density Polyethylene Sheet 10mm', 'MAT-UHMW-10', 'Abrasion-resistant 1200x2400mm machinable industrial plate.', 'Raw Materials', 84.00, 155.00, 0, 10, 40, 's1000000-0000-0000-0000-000000000003'),
('p1000000-0000-0000-0000-000000000004', 'Reinforced Corrugated Box 400x400x300mm', 'BOX-CRG-443', 'Heavy-duty double-wall transit carton (Bundle of 25).', 'Packaging & Shipping', 22.00, 44.50, 142, 50, 200, 's1000000-0000-0000-0000-000000000004'),
('p1000000-0000-0000-0000-000000000005', 'Ceramic Hybrid Ball Bearing 608-RS', 'BRG-HYB-608', 'Silicon nitride Si3N4 balls with low friction fluoropolymer seals.', 'Mechanical Hardware', 12.50, 28.00, 85, 30, 150, 's1000000-0000-0000-0000-000000000002'),
('p1000000-0000-0000-0000-000000000006', 'Arm Cortex-M7 Core Controller Board', 'MCU-M7-CORE', '480MHz 32-bit DSP embedded controller with CAN FD interface.', 'Electronics & Sensors', 62.00, 119.00, 8, 20, 80, 's1000000-0000-0000-0000-000000000001'),
('p1000000-0000-0000-0000-000000000007', 'Industrial ESD-Safe Lab Coat (Large)', 'PPE-ESD-L01', 'Static dissipative woven conductive grid laboratory coat.', 'Safety & PPE', 45.00, 85.00, 32, 15, 50, 's1000000-0000-0000-0000-000000000003'),
('p1000000-0000-0000-0000-000000000008', 'Direct Thermal Barcode Shipping Labels 4x6"', 'LBL-THM-4X6', 'Perforated roll of 1,000 top-coated high contrast labels.', 'Packaging & Shipping', 14.20, 29.90, 64, 25, 120, 's1000000-0000-0000-0000-000000000004')
ON CONFLICT (sku) DO NOTHING;

-- 4. Insert Transaction History
INSERT INTO public.inventory_transactions (id, product_id, type, quantity, previous_quantity, new_quantity, supplier_id, reason, reference_number, notes, transaction_date) VALUES
('t1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'IN', 25, 0, 25, 's1000000-0000-0000-0000-000000000001', 'Initial Purchase Order', 'PO-9021', 'Quarterly replenishment batch received.', NOW() - INTERVAL '14 days'),
('t1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'OUT', 12, 25, 13, NULL, 'Direct Sale', 'SO-4401', 'Shipped to autonomous robotics client in Boston.', NOW() - INTERVAL '7 days'),
('t1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'OUT', 9, 13, 4, NULL, 'Direct Sale', 'SO-4498', 'Express fulfillment for prototyping laboratory.', NOW() - INTERVAL '2 days'),
('t1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000004', 'IN', 150, 30, 180, 's1000000-0000-0000-0000-000000000004', 'Bulk Restock', 'PO-9088', 'Pallet delivery from Chicago distribution center.', NOW() - INTERVAL '5 days'),
('t1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 'OUT', 38, 180, 142, NULL, 'Packaging Fulfillment', 'PK-1102', 'Fulfillment cartons used for outbound client orders.', NOW() - INTERVAL '1 day'),
('t1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000006', 'OUT', 14, 22, 8, NULL, 'Production Kit Assembly', 'KIT-882', 'Issued for build run Alpha-6.', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;
