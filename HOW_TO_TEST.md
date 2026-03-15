# How to Test the Doctor Approval Workflow

## Quick Start Guide

Both servers are already running:
- ✅ Backend: http://localhost:5002
- ✅ Frontend: http://localhost:5173

## Test Scenario 1: Pending Doctor Login

### Step 1: Set Doctor to Pending Status
```bash
cd backend
node check-and-update-doctor.js
```
This will set gsaru952@gmail.com to "pending" status.

### Step 2: Doctor Login
1. Open browser: http://localhost:5173/login
2. Enter credentials:
   - Email: `gsaru952@gmail.com`
   - Password: `saruG@32`
3. Click "Sign In"

**Expected Result:** ✅ Redirected to "Registration Pending" page

### Step 3: Check Status (While Pending)
1. On the pending page, click "Check Status" button
2. Wait for the status check to complete

**Expected Result:** ✅ Message shows "Your account is still pending approval"

### Step 4: Admin Approves Doctor
1. Open new tab: http://localhost:5173/admin-login
2. Enter admin credentials:
   - Email: `admin@mentra.com`
   - Password: `admin123`
3. Click "Sign In"
4. Find "Lizan Ghimire" (gsaru952@gmail.com) in the list
5. Click the green "Approve" button

**Expected Result:** ✅ Status changes to "Approved" in the table

### Step 5: Doctor Checks Status Again
1. Go back to the pending page tab
2. Click "Check Status" button again

**Expected Result:** 
✅ Success message appears: "Your account has been approved!"
✅ Page automatically redirects to dashboard after 2 seconds
✅ Doctor now has full access to all features

## Test Scenario 2: Approved Doctor Login

### Step 1: Doctor Login (Already Approved)
1. Logout if logged in
2. Go to: http://localhost:5173/login
3. Enter credentials:
   - Email: `gsaru952@gmail.com`
   - Password: `saruG@32`
4. Click "Sign In"

**Expected Result:** ✅ Directly redirected to Doctor Dashboard (no pending page)

## Test Scenario 3: Admin Dashboard Features

### View All Doctors
1. Login to admin dashboard
2. See statistics cards showing:
   - Total Doctors
   - Pending Approval
   - Approved
   - Rejected

### Filter Doctors
1. Use the "Filter by Status" dropdown
2. Select "Pending" to see only pending doctors
3. Select "Approved" to see only approved doctors

### Search Doctors
1. Use the search box
2. Type doctor name, email, or specialization
3. Results filter in real-time

### Approve/Reject Actions
1. Find a pending doctor
2. Click "Approve" (green button) or "Reject" (red button)
3. Status updates immediately
4. Doctor can see the change on next status check

## Automated Testing

### Run Complete Workflow Test
```bash
cd backend
node test-complete-approval-flow.js
```

This will automatically:
1. Set doctor to pending
2. Test login
3. Check status
4. Approve doctor
5. Check status again
6. Verify dashboard access

**Expected Output:**
```
🎊 ALL WORKFLOW STEPS COMPLETED SUCCESSFULLY!
```

## Visual Verification Checklist

### Pending Page Should Show:
- ✅ Professional UI with Mentra branding
- ✅ "Registration Pending" title
- ✅ Progress bar (66% complete)
- ✅ Status badge showing "Pending"
- ✅ "Check Status" button (green, with refresh icon)
- ✅ "Logout" button
- ✅ Support email link
- ✅ Estimated review time (24-48 hours)

### After Approval:
- ✅ Success message with emoji
- ✅ "Redirecting to dashboard..." text
- ✅ Auto-redirect after 2 seconds
- ✅ Full dashboard with all tabs visible

### Admin Dashboard Should Show:
- ✅ Statistics cards at top
- ✅ Search and filter controls
- ✅ Table with all doctor information
- ✅ Status badges (color-coded)
- ✅ Action buttons (Approve/Reject)
- ✅ Document links (if uploaded)

## Common Issues & Solutions

### Issue: "Route not found" error
**Solution:** Make sure backend server is running on port 5002
```bash
cd backend
npm start
```

### Issue: Frontend not loading
**Solution:** Make sure frontend server is running
```bash
npm run dev
```

### Issue: Doctor still sees pending page after approval
**Solution:** Click "Check Status" button to refresh the approval status

### Issue: Can't login to admin dashboard
**Solution:** Use correct credentials:
- Email: admin@mentra.com
- Password: admin123

## Database Verification

### Check Doctor Status in Database
```bash
cd backend
node check-and-update-doctor.js
```

This will show all doctors and their current approval status.

## API Testing (Optional)

### Test Login API
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gsaru952@gmail.com","password":"saruG@32"}'
```

### Test Check Status API
```bash
curl -X GET http://localhost:5002/api/auth/check-doctor-status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Approve API
```bash
curl -X PUT http://localhost:5002/api/admin/doctors/DOCTOR_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

## Success Indicators

You'll know everything is working when:

1. ✅ Pending doctor can login successfully
2. ✅ Pending doctor sees the pending page (not dashboard)
3. ✅ "Check Status" button works and shows current status
4. ✅ Admin can approve doctors from dashboard
5. ✅ After approval, "Check Status" shows success message
6. ✅ Page auto-redirects to dashboard after approval
7. ✅ Approved doctor has full access to all features
8. ✅ All automated tests pass

## Need Help?

If something isn't working:

1. Check both servers are running (backend on 5002, frontend on 5173)
2. Check browser console for errors (F12)
3. Check backend terminal for error messages
4. Run the automated test script to verify backend functionality
5. Verify database connection is working

## Test Accounts

### Doctor Account:
- Email: gsaru952@gmail.com
- Password: saruG@32
- Can be set to any status for testing

### Admin Account:
- Email: admin@mentra.com
- Password: admin123
- Has full access to admin dashboard

### Other Test Doctors:
- dipak@gmail.com (pending)
- krisa@gmail.com (pending)
- john.doe.test@example.com (pending)

## Quick Test Commands

```bash
# Set doctor to pending
cd backend && node check-and-update-doctor.js

# Run complete workflow test
cd backend && node test-complete-approval-flow.js

# Check all doctors in database
cd backend && node check-and-update-doctor.js
```

---

**Happy Testing! 🎉**

Everything is set up and ready to test. The workflow is fully functional and all features are working as expected.
