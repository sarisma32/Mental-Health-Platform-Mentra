# Test: Double-Booking Prevention

## Quick Test Guide

Follow these steps to verify that booked time slots are NOT available to other patients:

### Prerequisites
-  Backend server running (port 5002)
-  Frontend server running (port 5173)
-  Doctor account: ghimiresarishma1@gmail.com / Gsaru952@
-  At least 2 patient accounts for testing

---

## Test Steps

### Step 1: Doctor Sets Schedule (5 minutes)

1. Open browser: `http://localhost:5173/login`
2. Login as doctor:
   - Email: ghimiresarishma1@gmail.com
   - Password: Gsaru952@
3. Click "Schedule" in sidebar
4. Click "Add Time Slot"
5. Select a future date (e.g., March 15, 2026)
6. Set times: 9:00 AM - 5:00 PM
7. Click "Add Slot"
8.  Verify: Slot appears in "Your Schedule" list
9. Sign out

---

### Step 2: Patient A Books 10:00 AM (5 minutes)

1. Go to: `http://localhost:5173/login`
2. Login as Patient A (any patient account)
3. Click "Professionals" in navigation
4. Find the doctor and click "Book Session"
5. Select appointment type (Initial or Follow-up)
6. Select date: March 15, 2026
7.  **IMPORTANT:** Note all available times shown
   - Should see: 9 AM, 10 AM, 11 AM, 12 PM, 1 PM, 2 PM, 3 PM, 4 PM
8. Select time: 10:00 AM
9. Fill in personal information
10. Click through to confirm booking
11.  Verify: Success message appears
12. Sign out

---

### Step 3: Patient B Tries to Book Same Time (5 minutes)

1. Go to: `http://localhost:5173/login`
2. Login as Patient B (different patient account)
3. Click "Professionals" in navigation
4. Find the SAME doctor and click "Book Session"
5. Select appointment type
6. Select date: March 15, 2026
7.  **VERIFY THE MAGIC:**
   - Available times should be: 9 AM, 11 AM, 12 PM, 1 PM, 2 PM, 3 PM, 4 PM
   - **10:00 AM should NOT appear!** 
   - This proves the system is working!
8. Select a different time (e.g., 2:00 PM)
9. Complete the booking
10.  Verify: Success message appears

---

### Step 4: Patient C Verifies Both Times Are Gone (3 minutes)

1. Login as Patient C (third patient account)
2. Go to book same doctor on March 15, 2026
3.  **VERIFY:**
   - 10:00 AM should NOT appear (booked by Patient A)
   - 2:00 PM should NOT appear (booked by Patient B)
   - Only remaining times should be shown

---

## Expected Results

###  Success Indicators:

1. **After Patient A books 10 AM:**
   - Patient B cannot see 10 AM in available slots
   - Patient B can only book other times

2. **After Patient B books 2 PM:**
   - Patient C cannot see 10 AM or 2 PM
   - Patient C can only book remaining times

3. **System Behavior:**
   - No error messages
   - Smooth booking process
   - Each patient sees only truly available slots

###  Failure Indicators:

1. **If 10 AM still appears for Patient B:**
   - System is NOT filtering booked times
   - Double-booking is possible
   - Need to check backend logic

2. **If all times disappear:**
   - Query might be too restrictive
   - Check database appointments table

---

## Quick API Test (Alternative)

If you don't have multiple patient accounts, test via API:

### 1. Add Doctor Schedule:
```bash
# Login as doctor first to get token
# Then use that token to add schedule
```

### 2. Check Available Slots (Before Booking):
```bash
curl http://localhost:5002/api/schedules/doctor/11/available?date=2026-03-15
```

Expected response:
```json
{
  "success": true,
  "availableSlots": [
    {"time": "09:00:00", "formatted": "9:00 AM"},
    {"time": "10:00:00", "formatted": "10:00 AM"},
    {"time": "11:00:00", "formatted": "11:00 AM"},
    ...
  ]
}
```

### 3. Book an Appointment:
```bash
# Use frontend to book 10:00 AM
```

### 4. Check Available Slots (After Booking):
```bash
curl http://localhost:5002/api/schedules/doctor/11/available?date=2026-03-15
```

Expected response:
```json
{
  "success": true,
  "availableSlots": [
    {"time": "09:00:00", "formatted": "9:00 AM"},
    {"time": "11:00:00", "formatted": "11:00 AM"},
    ...
  ]
}
```

**Note:** 10:00 AM should be MISSING from the second response!

---

## Troubleshooting

### Issue: All times still appear after booking

**Check:**
1. Is the appointment actually saved?
   ```sql
   SELECT * FROM appointments WHERE appointment_date = '2026-03-15';
   ```

2. Is the appointment_time format correct?
   - Should be: `10:00:00` (with seconds)
   - Not: `10:00 AM` or `10:00`

3. Is the status correct?
   - Should be: `confirmed` or `pending`
   - Not: `cancelled` or `no_show`

### Issue: No times appear at all

**Check:**
1. Does doctor have schedule for that date?
   ```sql
   SELECT * FROM doctor_schedules WHERE schedule_date = '2026-03-15';
   ```

2. Is the schedule marked as available?
   - `is_available` should be `TRUE`

---

## Database Verification

### Check Doctor's Schedule:
```sql
SELECT * FROM doctor_schedules 
WHERE doctor_id = 11 AND schedule_date = '2026-03-15';
```

### Check Booked Appointments:
```sql
SELECT 
  id,
  patient_id,
  appointment_date,
  appointment_time,
  status,
  created_at
FROM appointments 
WHERE doctor_id = 11 
  AND appointment_date = '2026-03-15'
ORDER BY appointment_time;
```

### Check Available Slots Logic:
```sql
-- This is what the backend does:
-- 1. Get schedule
SELECT * FROM doctor_schedules 
WHERE doctor_id = 11 AND schedule_date = '2026-03-15';

-- 2. Get booked times
SELECT appointment_time 
FROM appointments 
WHERE doctor_id = 11 
  AND appointment_date = '2026-03-15'
  AND status NOT IN ('cancelled', 'no_show');

-- 3. Backend filters: schedule times - booked times = available times
```

---

## Summary

 **The system ALREADY prevents double-booking**
 **No code changes needed**
 **Works automatically**
 **Real-time updates**

Just follow the test steps above to verify it's working in your application!

**Test Duration:** ~15-20 minutes
**Difficulty:** Easy
**Status:** Ready to test
