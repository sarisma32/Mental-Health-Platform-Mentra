# Doctor Schedule Management System - Implementation Guide

## Overview
Implemented a complete doctor availability/schedule management system where:
- **Doctors** can set their available time slots in the Schedule section
- **Patients** can only book appointments during doctor's available times
- System prevents double-booking and validates time slot availability

## Database Schema

### New Table: `doctor_schedules`
```sql
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Day of Week Mapping:**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

## Backend Implementation

### Files Created

1. **backend/db/add-doctor-schedule-table.sql**
   - SQL schema for doctor_schedules table
   - Includes indexes and constraints

2. **backend/create-schedule-table.js**
   - Script to create the table in database
   -  Already executed successfully

3. **backend/controllers/scheduleController.js**
   - `getDoctorSchedule()` - Get all schedule slots for a doctor
   - `addScheduleSlot()` - Add new availability slot
   - `deleteScheduleSlot()` - Remove availability slot
   - `updateScheduleSlot()` - Modify existing slot
   - `getAvailableTimeSlots()` - Get available times for a specific date

4. **backend/routes/scheduleRoutes.js**
   - Public routes for viewing schedules
   - Protected routes for managing schedules (doctor only)

5. **backend/server.js**
   - Added schedule routes: `/api/schedules`

### API Endpoints

#### Public Endpoints (No Auth Required)

**GET /api/schedules/doctor/:doctorId**
- Get doctor's weekly schedule
- Returns all available time slots

**GET /api/schedules/doctor/:doctorId/available?date=YYYY-MM-DD**
- Get available time slots for a specific date
- Excludes already booked times
- Returns formatted time slots

#### Protected Endpoints (Doctor Only)

**POST /api/schedules**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00"
}
```
- Add new availability slot
- Validates no overlapping slots

**PUT /api/schedules/:slotId**
```json
{
  "dayOfWeek": 1,
  "startTime": "10:00",
  "endTime": "18:00",
  "isAvailable": true
}
```
- Update existing slot

**DELETE /api/schedules/:slotId**
- Remove availability slot

## Frontend Implementation Needed

### 1. Doctor Dashboard - Schedule Section

Create a schedule management UI in `DoctorDashboardNew.jsx`:

```jsx
{activeSection === 'schedule' && (
  <ScheduleManagement />
)}
```

**Features Needed:**
- Weekly calendar view
- Add time slots for each day
- Edit/delete existing slots
- Visual representation of availability
- Toggle availability on/off

**UI Components:**
- Day selector (Mon-Sun)
- Time range picker (start time - end time)
- List of current schedule slots
- Add/Edit/Delete buttons

### 2. Booking Page - Available Slots Only

Update `BookAppointmentPage.jsx` to:

1. Fetch available slots for selected date:
```javascript
const fetchAvailableSlots = async (doctorId, date) => {
  const response = await fetch(
    buildApiUrl(`${API_ENDPOINTS.AVAILABLE_TIME_SLOTS}/${doctorId}/available?date=${date}`)
  );
  const data = await response.json();
  return data.availableSlots;
};
```

2. Display only available times (not hardcoded times)

3. Disable/hide unavailable slots

## How It Works

### Doctor Sets Schedule
1. Doctor logs into dashboard
2. Goes to "Schedule" section
3. Selects day of week (e.g., Monday)
4. Sets time range (e.g., 9:00 AM - 5:00 PM)
5. Clicks "Add Slot"
6. Slot saved to `doctor_schedules` table

### Patient Books Appointment
1. Patient selects a doctor
2. Chooses a date
3. System:
   - Gets day of week from date
   - Queries `doctor_schedules` for that day
   - Checks existing appointments
   - Returns only available slots
4. Patient sees only available times
5. Books appointment

### Validation Flow
```
1. Patient selects date (e.g., 2024-03-15 = Friday)
2. System converts to day_of_week (5 = Friday)
3. Query: SELECT * FROM doctor_schedules 
         WHERE doctor_id = X AND day_of_week = 5
4. Result: 09:00-17:00 available
5. Query: SELECT appointment_time FROM appointments 
         WHERE doctor_id = X AND appointment_date = '2024-03-15'
6. Result: 10:00, 14:00 already booked
7. Available slots: 09:00, 11:00, 12:00, 13:00, 15:00, 16:00
8. Show only these times to patient
```

## Example Schedule Setup

### Doctor's Weekly Schedule
```javascript
// Monday (1): 9 AM - 5 PM
{ doctor_id: 11, day_of_week: 1, start_time: '09:00', end_time: '17:00' }

// Tuesday (2): 10 AM - 6 PM
{ doctor_id: 11, day_of_week: 2, start_time: '10:00', end_time: '18:00' }

// Wednesday (3): 9 AM - 1 PM
{ doctor_id: 11, day_of_week: 3, start_time: '09:00', end_time: '13:00' }

// Thursday (4): 2 PM - 8 PM
{ doctor_id: 11, day_of_week: 4, start_time: '14:00', end_time: '20:00' }

// Friday (5): 9 AM - 5 PM
{ doctor_id: 11, day_of_week: 5, start_time: '09:00', end_time: '17:00' }

// Saturday (6): Not available (no entry)
// Sunday (0): Not available (no entry)
```

## Testing Instructions

### Test 1: Create Schedule (Backend)
```bash
# Using curl or Postman
POST http://localhost:5002/api/schedules
Headers: Authorization: Bearer {doctor_token}
Body: {
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00"
}
```

### Test 2: Get Doctor Schedule
```bash
GET http://localhost:5002/api/schedules/doctor/11
```

### Test 3: Get Available Slots for Date
```bash
GET http://localhost:5002/api/schedules/doctor/11/available?date=2024-03-18
```

### Test 4: Delete Schedule Slot
```bash
DELETE http://localhost:5002/api/schedules/{slotId}
Headers: Authorization: Bearer {doctor_token}
```

## Next Steps

### Immediate (Required for Full Functionality)

1. **Create Schedule Management UI Component**
   - File: `src/components/ScheduleManagement.jsx`
   - Weekly calendar interface
   - Add/edit/delete time slots
   - Visual schedule display

2. **Update Doctor Dashboard**
   - Integrate ScheduleManagement component
   - Replace "Coming soon" in Schedule section

3. **Update Booking Page**
   - Replace hardcoded time slots
   - Fetch available slots from API
   - Show only doctor's available times
   - Disable unavailable slots

### Future Enhancements

1. **Recurring Schedules**
   - Set schedule once, apply to all weeks
   - Exception dates (holidays, vacations)

2. **Break Times**
   - Lunch breaks
   - Buffer time between appointments

3. **Multiple Slots Per Day**
   - Morning shift: 9 AM - 12 PM
   - Evening shift: 2 PM - 6 PM

4. **Slot Duration Configuration**
   - 30-minute slots
   - 60-minute slots
   - Custom durations

## Benefits

 **For Doctors:**
- Full control over availability
- Prevent overbooking
- Flexible schedule management
- Work-life balance

 **For Patients:**
- See only available times
- No booking conflicts
- Clear availability visibility
- Better booking experience

 **For System:**
- Automated validation
- Reduced booking errors
- Better resource management
- Scalable solution

## Current Status

-  Database table created
-  Backend API implemented
-  Routes configured
-  Validation logic in place
-  Frontend UI pending
-  Integration with booking page pending

## Files Modified/Created

### Backend
-  `backend/db/add-doctor-schedule-table.sql`
-  `backend/create-schedule-table.js`
-  `backend/controllers/scheduleController.js`
-  `backend/routes/scheduleRoutes.js`
-  `backend/server.js`

### Frontend
-  `src/config/api.js` (added schedule endpoints)
-  `src/components/ScheduleManagement.jsx` (needs creation)
-  `src/components/DoctorDashboardNew.jsx` (needs update)
-  `src/components/BookAppointmentPage.jsx` (needs update)

The backend infrastructure is complete and ready. Frontend UI components need to be created to provide the user interface for schedule management and booking with availability validation.
