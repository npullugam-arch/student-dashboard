-- Removes obsolete multi-school columns that are not part of this application.
-- Run this once against the same PostgreSQL/Supabase database used by the app.
-- It is safe to run repeatedly and drops dependent foreign-key constraints first.

DO $$
DECLARE
    target_table text;
    target_constraint text;
BEGIN
    FOR target_table IN
        SELECT c.table_name
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.column_name = 'school_id'
    LOOP
        FOR target_constraint IN
            SELECT tc.constraint_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON kcu.constraint_schema = tc.constraint_schema
             AND kcu.constraint_name = tc.constraint_name
             AND kcu.table_name = tc.table_name
            WHERE tc.table_schema = 'public'
              AND tc.table_name = target_table
              AND kcu.column_name = 'school_id'
              AND tc.constraint_type = 'FOREIGN KEY'
        LOOP
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', target_table, target_constraint);
        END LOOP;

        EXECUTE format('ALTER TABLE public.%I DROP COLUMN school_id', target_table);
    END LOOP;
END $$;
