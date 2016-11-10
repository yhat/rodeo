SELECT
  x.nspname || '.' || x.relname AS "Table",
  x.attnum AS "#",
  x.attname AS "Column",
  x. "Type",
  CASE x.attnotnull
    WHEN TRUE THEN 'NOT NULL'
    ELSE ''
  END AS "NULL",
  r.conname AS "Constraint",
  r.contype AS "C",
  r.consrc,
  fn.nspname || '.' || f.relname AS "F Key",
  d.adsrc AS "Default"
FROM (
    SELECT
      c.oid,
      a.attrelid,
      a.attnum,
      n.nspname,
      c.relname,
      a.attname,
      pg_catalog.format_type (
        a.atttypid,
        a.atttypmod ) AS "Type",
      a.attnotnull
    FROM
      pg_catalog.pg_attribute a,
      pg_namespace n,
      pg_class c
    WHERE
      a.attnum > 0
      AND NOT a.attisdropped
      AND a.attrelid = c.oid
      AND c.relkind NOT IN (
        'S',
        'v' )
      AND c.relnamespace = n.oid
      AND n.nspname NOT IN (
        'pg_catalog',
        'pg_toast',
        'information_schema' ) )
  x
  LEFT JOIN pg_attrdef d ON d.adrelid = x.attrelid
  AND d.adnum = x.attnum
  LEFT JOIN pg_constraint r ON r.conrelid = x.oid
  AND r.conkey [ 1 ] = x.attnum
  LEFT JOIN pg_class f ON r.confrelid = f.oid
  LEFT JOIN pg_namespace fn ON f.relnamespace = fn.oid
WHERE
  x.relname = $1
  AND x.nspname = $2
ORDER BY
  1,
  2;
