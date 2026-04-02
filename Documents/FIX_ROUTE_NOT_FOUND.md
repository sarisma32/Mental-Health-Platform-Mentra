# Fix "Route not found" Error - Step by Step Guide

## Problem
When clicking "Add Slot" in the Schedule section, you see a red notification saying "Route not found".

## Root Cause
The backend server is running with the OLD schedule routes (day-of-week based). After we updated the database and controller to use date-based scheduling, the server needs to be restarted to load the new code.

## Solution: Restart Backend Server

### Step 1: Stop Current Server
1. Go to your terminal/command prompt where the backend server is running
2. Press `Ctrl + C` to stop the server
3. Wait for it to fully stop

### Step 2: Restart Server
```bash
cd backend
node server.js
```

### Step 3: Verify Server Started
You should see output like:
```
✅ Database connected successfully
✅ Admin routes mounted at /api/admin
✅ Auth routes mounted at /api/auth
✅ Patient routes mounted at /api/patients
✅ Doctor routes mounted at /api/doctors
✅ Appointment routes mounted at /api/appointments
✅ Dashboard routes mounted at /api/dashboard
✅ Schedule routes mounted at /api/schedules  ← This is important!
🚀 Server running on port 5002
```

### Step 4: Test the Routes (Optional)
Run this test script to verify routes are working:
```bash
cd backend
node test-schedule-routes.js
```

Expected output:
```
✅ Status: 200
📦 Response: {
  "success": true,
  "schedule": []
}
```

If you see "Route not found", the server wasn't restarted properly.

## Step 5: Test in Browser

1. **Refresh your browser** (F5 or Ctrl+R)
2. **Login as doctor** (ghimiresarishma1@gmail.com / Gsaru952@)
3. **Go to Schedule section**
4. **Click "Add Time Slot"**
5. **Select a date** from the calendar
6. **Set times** (e.g., 10:00 AM - 4:00 PM)
7. **Click "Add Slot"**

You should see:
- ✅ Green success notification: "Schedule slot added successfully!"
- ✅ The slot appears in "Your Schedule" list below
- ✅ The date shows green highlight in calendar

## Common Issues

### Issue 1: Server won't start
**Error:** `Port 5002 is already in use`

**Solution:**
1. Find and kill the process using port 5002:
   ```bash
   # Windows
   netstat -ano | findstr :5002
   taskkill /PID <PID_NUMBER> /F
   
   # Mac/Linux
   lsof -ti:5002 | xargs kill -9
   ```
2. Start server again

### Issue 2: Database connection error
**Error:** `Failed to connect to database`

**Solution:**
1. Make sure PostgreSQL is running
2. Check `.env` file has correct credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mentra_db
   DB_USER=postgres
   DB_PASSWORD=Sarismasql@32
   ```

### Issue 3: Still seeing "Route not found"
**Possible causes:**
1. Server wasn't fully restarted
2. Browser cache - try hard refresh (Ctrl+Shift+R)
3. Wrong port - verify backend is on 5002, frontend on 5173

**Solution:**
1. Stop server completely
2. Clear terminal
3. Start server fresh
4. Hard refresh browser
5. Clear browser console (F12 → Console → Clear)

## Verification Checklist

Before testing, verify:
- [ ] Backend server is running on port 5002
- [ ] You see "Schedule routes mounted" in server logs
- [ ] Frontend is running on port 5173
- [ ] You're logged in as a doctor
- [ ] Browser console is clear (F12 → Console)

## What Changed

### Database
- ✅ Changed from `day_of_week` (0-6) to `schedule_date` (YYYY-MM-DD)
- ✅ Table recreated with new schema
- ✅ Migration script executed successfully

### Backend API
- ✅ `addScheduleSlot` now accepts `scheduleDate` instead of `dayOfWeek`
- ✅ `getAvailableTimeSlots` queries by specific date
- ✅ All validation updated for date-based system

### Frontend
- ✅ Calendar interface for date selection
- ✅ Visual indicators for scheduled dates
- ✅ Form sends `scheduleDate` in request body

## Expected API Request

When you click "Add Slot", the frontend sends:

```json
POST http://localhost:5002/api/schedules
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  "scheduleDate": "2026-03-09",
  "startTime": "10:00",
  "endTime": "16:00"
}
```

Expected response:
```json
{
  "success": true,
  "message": "Schedule slot added successfully!",
  "slot": {
    "id": 1,
    "doctor_id": 11,
    "schedule_date": "2026-03-09",
    "start_time": "10:00:00",
    "end_time": "16:00:00",
    "is_available": true,
    "created_at": "2026-03-08T..."
  }
}
```

## Still Having Issues?

If the problem persists after restarting:

1. **Check server logs** - Look for any error messages
2. **Check browser console** (F12) - Look for network errors
3. **Test API directly** - Use the test script or Postman
4. **Verify database** - Run: `SELECT * FROM doctor_schedules;`

## Quick Debug Commands

```bash
# Check if server is running
curl http://localhost:5002/api/health

# Test schedule route
curl http://localhost:5002/api/schedules/doctor/11

# Check database table
psql -U postgres -d mentra_db -c "SELECT * FROM doctor_schedules;"
```

## Success Indicators

You'll know it's working when:
1. ✅ No red "Route not found" notification
2. ✅ Green "Schedule slot added successfully!" notification appears
3. ✅ Slot appears in schedule list immediately
4. ✅ Calendar date shows green highlight
5. ✅ Browser console shows 200 status code

---

**TL;DR:** Stop your backend server (Ctrl+C) and restart it with `node server.js`. The routes were updated but the server needs to reload the new code.
