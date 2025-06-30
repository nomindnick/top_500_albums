import csv
import os
from sqlalchemy import create_engine, text
from app.models import Album
from app import create_app, db

def seed_albums_table(csv_filepath):
    app = create_app()
    
    with app.app_context():
        try:
            # Check if albums already exist
            existing_count = Album.query.count()
            print(f"Existing albums in database: {existing_count}")
            
            if existing_count > 0:
                print("Albums already seeded, skipping...")
                return
            
            with open(csv_filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                albums_added = 0
                
                for row in reader:
                    album = Album(
                        rank=int(row['Rank']),
                        artist=row['Artist'],
                        album=row['Album'],
                        info=row.get('Info', ''),
                        description=row.get('Description', '')
                    )
                    db.session.add(album)
                    albums_added += 1
                    
                    if albums_added % 50 == 0:
                        print(f"Added {albums_added} albums...")
                
                db.session.commit()
                print(f"Successfully seeded {albums_added} albums!")
                
                # Verify
                final_count = Album.query.count()
                print(f"Total albums in database: {final_count}")
                
        except Exception as e:
            print(f"Error seeding albums table: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    # In Docker, the CSV is in the same directory
    csv_file = 'rolling_stone_top_500_albums_2020.csv'
    if not os.path.exists(csv_file):
        # Try parent directory for local development
        csv_file = '../rolling_stone_top_500_albums_2020.csv'
    
    if not os.path.exists(csv_file):
        print(f"ERROR: CSV file not found at {csv_file}")
        exit(1)
        
    print(f"Using CSV file: {csv_file}")
    seed_albums_table(csv_file)