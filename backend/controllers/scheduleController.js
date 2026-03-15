import pool from "../db/index.js";

// GET DOCTOR SCHEDULE (for a date range)
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    let query = `SELECT * FROM doctor_schedules 
                 WHERE doctor_id = $1 AND is_available = TRUE`;
    let params = [doctorId];

    if (startDate && endDate) {
      query += ` AND schedule_date BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND schedule_date >= $2`;
      params.push(startDate);
    }

    query += ` ORDER BY schedule_date, start_time`;

    const schedule = await pool.query(query, params);

    res.json({
      success: true,
      schedule: schedule.rows
    });
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ADD SCHEDULE SLOT
export const addScheduleSlot = async (req, res) => {
  try {
    const doctorId = req.user.id; // From JWT token
    const { scheduleDate, startTime, endTime } = req.body;

    // Validate input
    if (!scheduleDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Schedule date, start time, and end time are required"
      });
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(scheduleDate);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot add schedule for past dates"
      });
    }

    // Validate start time < end time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time"
      });
    }

    // Check for overlapping slots on the same date
    const overlap = await pool.query(
      `SELECT * FROM doctor_schedules 
       WHERE doctor_id = $1 AND schedule_date = $2 
       AND is_available = TRUE
       AND (
         (start_time <= $3 AND end_time > $3) OR
         (start_time < $4 AND end_time >= $4) OR
         (start_time >= $3 AND end_time <= $4)
       )`,
      [doctorId, scheduleDate, startTime, endTime]
    );

    if (overlap.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This time slot overlaps with an existing schedule on this date."
      });
    }

    // Add new schedule slot
    const newSlot = await pool.query(
      `INSERT INTO doctor_schedules (doctor_id, schedule_date, start_time, end_time, is_available)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING *`,
      [doctorId, scheduleDate, startTime, endTime]
    );

    res.status(201).json({
      success: true,
      message: "Schedule slot added successfully!",
      slot: newSlot.rows[0]
    });
  } catch (error) {
    console.error('Add schedule slot error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add schedule slot.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE SCHEDULE SLOT
export const deleteScheduleSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slotId } = req.params;

    // Verify the slot belongs to this doctor
    const slot = await pool.query(
      "SELECT * FROM doctor_schedules WHERE id = $1 AND doctor_id = $2",
      [slotId, doctorId]
    );

    if (slot.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule slot not found or doesn't belong to you."
      });
    }

    // Delete the slot
    await pool.query(
      "DELETE FROM doctor_schedules WHERE id = $1",
      [slotId]
    );

    res.json({
      success: true,
      message: "Schedule slot deleted successfully!"
    });
  } catch (error) {
    console.error('Delete schedule slot error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule slot.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE SCHEDULE SLOT
export const updateScheduleSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slotId } = req.params;
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

    // Verify the slot belongs to this doctor
    const slot = await pool.query(
      "SELECT * FROM doctor_schedules WHERE id = $1 AND doctor_id = $2",
      [slotId, doctorId]
    );

    if (slot.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule slot not found or doesn't belong to you."
      });
    }

    // Update the slot
    const updatedSlot = await pool.query(
      `UPDATE doctor_schedules 
       SET day_of_week = COALESCE($1, day_of_week),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           is_available = COALESCE($4, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [dayOfWeek, startTime, endTime, isAvailable, slotId]
    );

    res.json({
      success: true,
      message: "Schedule slot updated successfully!",
      slot: updatedSlot.rows[0]
    });
  } catch (error) {
    console.error('Update schedule slot error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update schedule slot.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET AVAILABLE TIME SLOTS FOR A SPECIFIC DATE
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }

    // Get doctor's schedule for this specific date
    const schedule = await pool.query(
      `SELECT * FROM doctor_schedules 
       WHERE doctor_id = $1 AND schedule_date = $2 AND is_available = TRUE
       ORDER BY start_time`,
      [doctorId, date]
    );

    if (schedule.rows.length === 0) {
      return res.json({
        success: true,
        availableSlots: [],
        message: "Doctor is not available on this date"
      });
    }

    // Get existing appointments for this date
    const appointments = await pool.query(
      `SELECT appointment_time, duration_minutes 
       FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 
       AND status NOT IN ('cancelled', 'no_show')`,
      [doctorId, date]
    );

    const bookedTimes = appointments.rows.map(apt => apt.appointment_time);

    // Generate available time slots
    const availableSlots = [];
    
    for (const slot of schedule.rows) {
      const startTime = slot.start_time;
      const endTime = slot.end_time;
      
      // Generate 1-hour slots between start and end time
      let currentTime = startTime;
      
      while (currentTime < endTime) {
        // Check if this time is not already booked
        if (!bookedTimes.includes(currentTime)) {
          availableSlots.push({
            time: currentTime,
            formatted: formatTime(currentTime)
          });
        }
        
        // Move to next hour
        const [hours, minutes] = currentTime.split(':');
        const nextHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        currentTime = `${nextHour}:${minutes}:00`;
        
        // Stop if we've reached or passed the end time
        if (currentTime >= endTime) break;
      }
    }

    res.json({
      success: true,
      availableSlots,
      date
    });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available time slots.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to format time
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
