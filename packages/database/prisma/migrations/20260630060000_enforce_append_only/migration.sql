-- Enforce append-only at the database level for the financial ledger and the
-- audit trail. The application only ever INSERTs into these tables, so blocking
-- UPDATE/DELETE here is defence-in-depth: even a compromised application
-- credential cannot rewrite financial history or tamper with the audit log.
--
-- Reversible: drop the triggers and the function (see the bottom of this file).

CREATE OR REPLACE FUNCTION reject_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only; % is not permitted', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "LedgerEntry_append_only" ON "LedgerEntry";
CREATE TRIGGER "LedgerEntry_append_only"
  BEFORE UPDATE OR DELETE ON "LedgerEntry"
  FOR EACH ROW EXECUTE FUNCTION reject_mutation();

DROP TRIGGER IF EXISTS "AuditLog_append_only" ON "AuditLog";
CREATE TRIGGER "AuditLog_append_only"
  BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION reject_mutation();

-- To roll back:
--   DROP TRIGGER IF EXISTS "LedgerEntry_append_only" ON "LedgerEntry";
--   DROP TRIGGER IF EXISTS "AuditLog_append_only" ON "AuditLog";
--   DROP FUNCTION IF EXISTS reject_mutation();
