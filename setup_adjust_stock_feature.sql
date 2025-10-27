-- SQL Setup for Adjust Stock Feature
-- NO DATABASE CHANGES REQUIRED!

-- This feature uses your existing database structure
-- No new columns or tables need to be added

-- Your existing inventory_ledger table should have these columns:
-- - ledger_id
-- - product_id
-- - location_id
-- - type
-- - qty
-- - past_balance
-- - current_balance
-- - done_by
-- - date
-- - time

-- That's all you need! The adjust stock feature will work with this structure.

-- To verify your table has the required columns, you can run:
-- DESCRIBE inventory_ledger;

