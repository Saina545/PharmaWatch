import psycopg2

# Connect to your database
DATABASE_URL = "postgresql://pharmawatch_user:pharmawatch_dev_pass@127.0.0.1:5433/pharmawatch"
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Ask PostgreSQL for a list of all tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")

print("=== Your Database Tables ===")
for row in cur.fetchall():
    print(f" - {row[0]}")