-- ==============================================================================
-- FinAI Category Groups (Global) & Workspace Categories Seed
-- Workspace: 43c7361a-ff3b-4fdc-9837-bfa429b516cf
-- Run this in psql or any PostgreSQL client
-- ==============================================================================

DO $$
DECLARE
  ws_id TEXT := '43c7361a-ff3b-4fdc-9837-bfa429b516cf';

  g_income   TEXT;
  g_fixed    TEXT;
  g_variable TEXT;
  g_savings  TEXT;
  g_transfer TEXT;
BEGIN

  -- ── 1. Ensure Global Category Groups exist (no workspace_id) ───────────────
  INSERT INTO category_groups (id, name, "order") VALUES
    (gen_random_uuid(), 'Income',                1),
    (gen_random_uuid(), 'Fixed Expenses',        2),
    (gen_random_uuid(), 'Variable Expenses',     3),
    (gen_random_uuid(), 'Savings & Investments', 4),
    (gen_random_uuid(), 'Transfer',              5)
  ON CONFLICT (name) DO UPDATE SET "order" = EXCLUDED."order";

  -- Fetch group IDs
  SELECT id INTO g_income   FROM category_groups WHERE name = 'Income';
  SELECT id INTO g_fixed    FROM category_groups WHERE name = 'Fixed Expenses';
  SELECT id INTO g_variable FROM category_groups WHERE name = 'Variable Expenses';
  SELECT id INTO g_savings  FROM category_groups WHERE name = 'Savings & Investments';
  SELECT id INTO g_transfer FROM category_groups WHERE name = 'Transfer';

  -- ── 2. Upsert Workspace Categories ────────────────────────────────────────

  -- Income
  INSERT INTO categories (id, workspace_id, "group", group_id, name, icon) VALUES
    (gen_random_uuid(), ws_id, 'Income', g_income, 'Salary',             '💰'),
    (gen_random_uuid(), ws_id, 'Income', g_income, 'Cashback & Refunds', '💸'),
    (gen_random_uuid(), ws_id, 'Income', g_income, 'Loan Received Back', '💵')
  ON CONFLICT (workspace_id, name) DO UPDATE
    SET "group" = EXCLUDED."group", group_id = EXCLUDED.group_id, icon = EXCLUDED.icon;

  -- Fixed Expenses
  INSERT INTO categories (id, workspace_id, "group", group_id, name, icon) VALUES
    (gen_random_uuid(), ws_id, 'Fixed Expenses', g_fixed, 'Medical',      '🏥'),
    (gen_random_uuid(), ws_id, 'Fixed Expenses', g_fixed, 'Pregnancy',    '🤰'),
    (gen_random_uuid(), ws_id, 'Fixed Expenses', g_fixed, 'Education',    '📚'),
    (gen_random_uuid(), ws_id, 'Fixed Expenses', g_fixed, 'Gym & Fitness','🏋️'),
    (gen_random_uuid(), ws_id, 'Fixed Expenses', g_fixed, 'Taxes',        '🧾'),
    (gen_random_uuid(), ws_id, 'Fixed Expenses', g_fixed, 'Bank Charges', '🏛️')
  ON CONFLICT (workspace_id, name) DO UPDATE
    SET "group" = EXCLUDED."group", group_id = EXCLUDED.group_id, icon = EXCLUDED.icon;

  -- Variable Expenses
  INSERT INTO categories (id, workspace_id, "group", group_id, name, icon) VALUES
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Groceries',          '🛒'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Vegetables & Fruits','🥦'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Meat & Seafood',     '🍗'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Outside Food',       '🍽️'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Online Food Order',  '🛵'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Snacks',             '🍿'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Fuel',               '⛽'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Vehicle',            '🚗'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Public Transport',   '🚇'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Shopping',           '🛍️'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Entertainment',      '🎬'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Travel',             '✈️'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Personal Care',      '💇'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Parents',            '👨‍👩‍👧'),
    (gen_random_uuid(), ws_id, 'Variable Expenses', g_variable, 'Miscellaneous',      '📦')
  ON CONFLICT (workspace_id, name) DO UPDATE
    SET "group" = EXCLUDED."group", group_id = EXCLUDED.group_id, icon = EXCLUDED.icon;

  -- Savings & Investments
  INSERT INTO categories (id, workspace_id, "group", group_id, name, icon) VALUES
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'Emergency Fund','🆘'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'Investments',   '📈'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'Mutual Funds',  '📊'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'Stocks',        '📉'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'Fixed Deposit', '🏦'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'Gold',          '🪙'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'PPF',           '🏛️'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'NPS',           '🛡️'),
    (gen_random_uuid(), ws_id, 'Savings & Investments', g_savings, 'SIP',           '📅')
  ON CONFLICT (workspace_id, name) DO UPDATE
    SET "group" = EXCLUDED."group", group_id = EXCLUDED.group_id, icon = EXCLUDED.icon;

  -- Transfer
  INSERT INTO categories (id, workspace_id, "group", group_id, name, icon) VALUES
    (gen_random_uuid(), ws_id, 'Transfer', g_transfer, 'Transfer',       '🔄'),
    (gen_random_uuid(), ws_id, 'Transfer', g_transfer, 'Borrow',         '🤝'),
    (gen_random_uuid(), ws_id, 'Transfer', g_transfer, 'Debt Repayment', '💳'),
    (gen_random_uuid(), ws_id, 'Transfer', g_transfer, 'Lend',           '🤲')
  ON CONFLICT (workspace_id, name) DO UPDATE
    SET "group" = EXCLUDED."group", group_id = EXCLUDED.group_id, icon = EXCLUDED.icon;

END $$;
