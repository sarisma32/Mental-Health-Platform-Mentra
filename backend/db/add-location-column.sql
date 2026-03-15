-- Add location column to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Update existing doctors with a default location (optional)
UPDATE doctors 
SET location = 'Not specified' 
WHERE location IS NULL;

-- Create index for location searches
CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(location);

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'doctors' AND column_name = 'location';
