sleep 5; psql -h localhost --username postgres -c "CREATE TABLE distributors ( \
    did     integer, \
    name    varchar(40), \
    UNIQUE(name) \
);"
