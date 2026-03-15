-- Drop the old day-of-week based table
DROP TABLE IF EXISTS doctor_schedules;

-- Create new date-based schedule table
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, schedule_date, start_time)
);

-- Create index for faster queries
CREATE INDEX idx_doctor_schedules_doctor_date ON doctor_schedules(doctor_id, schedule_date);
CREATE INDEX idx_doctor_schedules_date ON doctor_schedules(schedule_date);

-- Add comment
COMMENT ON TABLE doctor_schedules IS 'Stores doctor availability for specific dates';
