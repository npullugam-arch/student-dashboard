package com.school.portal.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Removes legacy multi-school columns from databases created by an older
 * version of the portal.  The current application has no school_id mapping,
 * so keeping a NOT NULL school_id column makes inserts into users, students,
 * teachers, and other portal tables fail.
 *
 * This operation is idempotent: after the columns have been removed it does
 * nothing on later application starts.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ObsoleteSchoolIdSchemaCleanup {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void removeLegacySchoolIdColumns() {
        List<String> tableNames = jdbcTemplate.queryForList("""
                select table_name
                from information_schema.columns
                where table_schema = ? and column_name = ?
                """, String.class, "public", "school_id");

        for (String tableName : tableNames) {
            String quotedTableName = "\"" + tableName.replace("\"", "\"\"") + "\"";
            jdbcTemplate.execute("alter table public." + quotedTableName
                    + " drop column if exists school_id cascade");
            log.info("Removed obsolete school_id column from public.{}", tableName);
        }
    }
}
