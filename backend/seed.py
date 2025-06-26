
import csv
import os
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://albums_countdown_user:nick6196@localhost:5432/albums_countdown_db')

def seed_albums_table(csv_filepath):
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS albums (
                id SERIAL PRIMARY KEY,
                rank INTEGER NOT NULL UNIQUE,
                artist VARCHAR(255) NOT NULL,
                album VARCHAR(255) NOT NULL,
                info TEXT,
                description TEXT
            );
        """)
        conn.commit()

        with open(csv_filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cur.execute("""
                    INSERT INTO albums (rank, artist, album, info, description)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (rank) DO NOTHING;
                """, (row['Rank'], row['Artist'], row['Album'], row['Info'], row['Description']))
            conn.commit()
        print("Albums table seeded successfully.")

    except Exception as e:
        print(f"Error seeding albums table: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    csv_file = '../rolling_stone_top_500_albums_2020.csv'
    seed_albums_table(csv_file)
