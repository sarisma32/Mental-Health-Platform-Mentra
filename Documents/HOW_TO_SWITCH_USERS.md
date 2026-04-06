# How to Switch Between Admin, Doctor, and Patient Logins

##  Quick Guide to Switch Users

### Method 1: Use the Logout Button (EASIEST)

#### From Admin Dashboard:
1. Look at the top right of the admin dashboard
2. Click the red **"Logout"** button
3. You'll be redirected to admin login page
4. Now you can login as doctor or patient

#### From Doctor/Patient Dashboard:
1. Click your profile icon (top right)
2. Find and click "Logout" option
3. You'll be redirected to home page
4. Now you can login as admin, doctor, or patient

---

### Method 2: Open Incognito/Private Window (RECOMMENDED FOR TESTING)

This way you can have multiple users logged in at the same time!

**Chrome:**
- Press `Ctrl + Shift + N`
- Go to http://localhost:5173/login
- Login as different user

**Firefox:**
- Press `Ctrl + Shift + P`
- Go to http://localhost:5173/login
- Login as different user

**Edge:**
- Press `Ctrl + Shift + N`
- Go to http://localhost:5173/login
- Login as different user

---

### Method 3: Clear Browser Storage (Manual)

1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page (F5)
6. Now you can login as any user

---

##  Test Accounts

###  Admin Account
```
URL: http://localhost:5173/admin-login
Email: admin@mentra.com
Password: admin123
```

###  Doctor Accounts

**Approved Doctor:**
```
URL: http://localhost:5173/login
Email: gsaru952@gmail.com
Password: saruG@32
Status: Approved (goes directly to dashboard)
```

**Pending Doctors:**
```
Email: dipak@gmail.com
Email: krisa@gmail.com
Email: john.doe.test@example.com
Status: Pending (sees "Registration Pending" page)
Note: You need to know their passwords
```

###  Patient Account
```
URL: http://localhost:5173/login
Email: (any registered patient email)
Password: (their password)
```

---

##  Complete Testing Workflow

### Scenario 1: Test Admin Approval

1. **Login as Admin**
   - Go to http://localhost:5173/admin-login
   - Login: admin@mentra.com / admin123
   - You see admin dashboard

2. **Approve a Pending Doctor**
   - Find a doctor with "Pending" status
   - Click green "Approve" button
   - Status changes to "Approved"

3. **Logout from Admin**
   - Click red "Logout" button (top right)

4. **Login as That Doctor**
   - Go to http://localhost:5173/login
   - Enter doctor's email and password
   - Doctor goes directly to dashboard (approved!)

---

### Scenario 2: Test Pending Doctor Flow

1. **Set Doctor to Pending** (if needed)
   ```bash
   cd backend
   node check-and-update-doctor.js
   ```

2. **Login as Pending Doctor**
   - Go to http://localhost:5173/login
   - Login: gsaru952@gmail.com / saruG@32
   - You see "Registration Pending" page

3. **Check Status**
   - Click "Check Status" button
   - Shows "still pending"

4. **Open New Incognito Window**
   - Press Ctrl + Shift + N

5. **Login as Admin (in incognito)**
   - Go to http://localhost:5173/admin-login
   - Login: admin@mentra.com / admin123

6. **Approve the Doctor**
   - Find the doctor
   - Click "Approve"

7. **Go Back to Doctor Window**
   - Click "Check Status" again
   - Shows "Approved!" message
   - Auto-redirects to dashboard

---

##  Quick Switch Commands

### Currently Admin → Want to be Doctor:
1. Click "Logout" button (top right)
2. Go to http://localhost:5173/login
3. Login as doctor

### Currently Doctor → Want to be Admin:
1. Logout from doctor dashboard
2. Go to http://localhost:5173/admin-login
3. Login as admin

### Currently Patient → Want to be Admin:
1. Logout from patient dashboard
2. Go to http://localhost:5173/admin-login
3. Login as admin

---

##  Pro Tips

### Tip 1: Use Multiple Browser Windows
- **Window 1:** Admin (normal browser)
- **Window 2:** Doctor (incognito)
- **Window 3:** Patient (different browser)

This way you can test the complete flow without logging out!

### Tip 2: Use Different Browsers
- **Chrome:** Admin
- **Firefox:** Doctor
- **Edge:** Patient

Each browser has separate storage, so you can be logged in as different users!

### Tip 3: Quick Logout Shortcut
Press F12 → Console → Type: `localStorage.clear()` → Enter → Refresh

---

##  Common Questions

**Q: I'm logged in as admin but see patient homepage?**
A: Click the green "A" profile icon in the header - it will take you to admin dashboard.

**Q: How do I test multiple users at once?**
A: Use incognito windows or different browsers for each user.

**Q: I forgot to logout, how do I switch users?**
A: Press F12, type `localStorage.clear()`, press Enter, refresh page.

**Q: Where is the logout button?**
A: 
- Admin: Top right of admin dashboard (red button)
- Doctor/Patient: Click profile icon, then logout

---

##  You're Ready!

Now you can easily switch between:
-  Admin (manage doctors)
-  Doctor (view appointments, patients)
-  Patient (book appointments)

**Happy Testing!** 
