# Admin Dashboard - Quick Guide

## 🔐 How to Access Admin Dashboard

### Step-by-Step Instructions:

#### 1. Open Admin Login Page
```
URL: http://localhost:5173/admin-login
```

#### 2. Enter Admin Credentials
```
Email: admin@mentra.com
Password: admin123
```

#### 3. Click "Sign In"
You'll be redirected to the admin dashboard automatically.

---

## 📊 Admin Dashboard Features

### Statistics Overview
At the top of the dashboard, you'll see 4 cards showing:
- **Total Doctors** - All registered doctors
- **Pending Approval** - Doctors waiting for review
- **Approved** - Active doctors
- **Rejected** - Rejected applications

### Search & Filter
- **Search Box** - Search by name, email, or specialization
- **Filter Dropdown** - Filter by status (All, Pending, Approved, Rejected)

### Doctor Information Table
Each row shows:
- **Doctor Information**
  - Full Name
  - Email Address
  - Phone Number

- **Contact & Credentials**
  - License Number
  - Years of Experience
  - View Document Link (if uploaded)

- **Professional Details**
  - Specialization
  - Hospital Name

- **Status Badge**
  - Yellow badge = Pending
  - Green badge = Approved
  - Red badge = Rejected

- **Action Buttons**
  - Green "Approve" button (for pending doctors)
  - Red "Reject" button (for pending doctors)
  - "Revoke" button (for approved doctors)

---

## ✅ How to Approve a Doctor

### Method 1: Approve Pending Doctor
1. Login to admin dashboard
2. Look for doctors with "Pending" status (yellow badge)
3. Review their information:
   - Check license number
   - Verify experience
   - Click "View Document" to see uploaded credentials
4. Click the green **"Approve"** button
5. Status changes to "Approved" immediately
6. Doctor can now access full dashboard after checking status

### Method 2: Use Filter to Find Pending Doctors
1. Click the "Filter by Status" dropdown
2. Select "Pending"
3. Only pending doctors will be shown
4. Review and approve as needed

---

## ❌ How to Reject a Doctor

1. Find the doctor with "Pending" status
2. Review their information
3. Click the red **"Reject"** button
4. Status changes to "Rejected" immediately
5. Doctor will see rejection message on login

---

## 🔄 How to Revoke Approval

If you need to revoke an approved doctor:
1. Find the doctor with "Approved" status
2. Click the red **"Revoke"** button
3. Status changes back to "Rejected"

---

## 🔍 Search & Filter Examples

### Search Examples:
- Type "John" - Shows all doctors named John
- Type "cardiology" - Shows all cardiologists
- Type "@gmail.com" - Shows all doctors with Gmail

### Filter Examples:
- Select "Pending" - Shows only pending applications
- Select "Approved" - Shows only active doctors
- Select "Rejected" - Shows only rejected applications
- Select "All Status" - Shows everyone

---

## 📋 Current Test Doctors in Database

Based on the test data, you should see these doctors:

### Approved Doctors:
1. **Lizan Ghimire** - lizan.ghimire@gmail.com
2. **Lizan Ghimire** - gsaru952@gmail.com (can be set to pending for testing)
3. **Dr. Emily Rodriguez** - emily.rodriguez@mentra.com
4. **Dr. Michael Chen** - michael.chen@mentra.com
5. **Dr. Sarah Johnson** - sarah.johnson@mentra.com
6. **Dr. Jane Smith** - jane.smith@test.com

### Pending Doctors:
1. **dipak kc** - dipak@gmail.com
2. **Dr. John Doe** - john.doe.test@example.com
3. **krisala reule** - krisa@gmail.com

---

## 🧪 Testing the Approval Workflow

### Complete Test Scenario:

#### Step 1: Set Doctor to Pending (Optional)
If you want to test with gsaru952@gmail.com:
```bash
cd backend
node check-and-update-doctor.js
```
This sets the doctor to pending status.

#### Step 2: Admin Approves
1. Go to http://localhost:5173/admin-login
2. Login with admin credentials
3. Find "Lizan Ghimire" (gsaru952@gmail.com)
4. Click "Approve" button
5. Status changes to "Approved"

#### Step 3: Doctor Sees Change
1. Doctor logs in at http://localhost:5173/login
2. If still on pending page, clicks "Check Status"
3. Gets success message
4. Auto-redirects to dashboard
5. Has full access!

---

## 🎯 Quick Actions

### To Approve All Pending Doctors:
1. Filter by "Pending"
2. Review each doctor
3. Click "Approve" for each one
4. They can now access their dashboards

### To Find a Specific Doctor:
1. Use the search box
2. Type their name or email
3. Review their information
4. Take action (Approve/Reject)

---

## 🔒 Admin Account Details

**Email:** admin@mentra.com  
**Password:** admin123  
**Access Level:** Full admin access  
**Can:** View, Approve, Reject all doctor registrations

---

## 📱 Admin Dashboard URL

**Direct Link:** http://localhost:5173/admin-dashboard

**Note:** You must be logged in as admin to access this page. If not logged in, you'll be redirected to the admin login page.

---

## ✨ Tips

1. **Review Documents:** Always click "View Document" to verify credentials
2. **Check License Numbers:** Ensure they look legitimate
3. **Verify Experience:** Check if experience matches their profile
4. **Use Filters:** Makes it easier to focus on pending applications
5. **Search Function:** Quick way to find specific doctors

---

## 🆘 Troubleshooting

### Can't Login?
- Make sure you're using: admin@mentra.com / admin123
- Check if backend server is running on port 5002

### Don't See Any Doctors?
- Check if backend is connected to database
- Run: `cd backend && node check-and-update-doctor.js` to see all doctors

### Approve Button Not Working?
- Check browser console for errors (F12)
- Verify backend server is running
- Check network tab for API response

---

## 🎉 You're Ready!

Now you can:
- ✅ Access admin dashboard
- ✅ View all doctor registrations
- ✅ Approve pending doctors
- ✅ Reject applications
- ✅ Search and filter doctors
- ✅ Manage all doctor accounts

**Admin Dashboard URL:** http://localhost:5173/admin-login

**Happy Managing! 👨‍💼**
