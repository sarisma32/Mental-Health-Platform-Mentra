# Doctor Profile Enhancement - Implementation Plan

## Goal
1. Show ONLY approved doctors in Professionals page
2. Allow doctors to edit and add additional profile information
3. Display complete doctor profiles with all information

---

## Phase 1: Database Schema Updates

### Add New Columns to `doctors` Table:

```sql
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS session_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS credentials TEXT,
ADD COLUMN IF NOT EXISTS languages VARCHAR(255),
ADD COLUMN IF NOT EXISTS availability_hours TEXT;
```

---

## Phase 2: Backend API Updates

### 1. Update `getApprovedDoctors` Controller
**File:** `backend/controllers/doctorController.js`

```javascript
export const getApprovedDoctors = async (req, res) => {
  const query = `
    SELECT id, full_name, specialization, hospital_name, location, 
           experience, profile_photo, bio, session_fee, rating, 
           review_count, created_at
    FROM doctors 
    WHERE approval_status = 'approved'
    ORDER BY created_at DESC
  `;
  // Return only approved doctors
};
```

### 2. Create Doctor Profile Update Endpoint
**File:** `backend/controllers/doctorController.js`

```javascript
export const updateDoctorProfile = async (req, res) => {
  const {
    bio,
    session_fee,
    years_experience,
    credentials,
    languages,
    availability_hours
  } = req.body;
  
  // Update doctor profile with additional information
  // Only the logged-in doctor can update their own profile
};
```

### 3. Create Profile Photo Upload Endpoint
```javascript
export const uploadProfilePhoto = async (req, res) => {
  // Handle profile photo upload
  // Store in uploads/profiles folder
  // Update profile_photo column
};
```

---

## Phase 3: Frontend - Professionals Page Update

### Update `ProfessionalsPage.jsx` to Fetch Real Data

```javascript
useEffect(() => {
  fetchApprovedDoctors();
}, []);

const fetchApprovedDoctors = async () => {
  try {
    const response = await fetch(buildApiUrl('/api/doctors/approved'));
    const data = await response.json();
    
    if (data.success) {
      setProfessionals(data.doctors);
    }
  } catch (error) {
    console.error('Error fetching doctors:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## Phase 4: Doctor Profile Edit Page

### Create New Component: `DoctorProfileEdit.jsx`

**Features:**
- Profile photo upload
- Bio/description editor
- Session fee input
- Years of experience
- Credentials
- Languages spoken
- Availability hours
- Save button

**Layout:**
```
┌─────────────────────────────────────┐
│  Doctor Profile Settings            │
├─────────────────────────────────────┤
│  [Profile Photo Upload]             │
│                                     │
│  Bio/Description:                   │
│  [Text Area]                        │
│                                     │
│  Session Fee: [Input] Rs/session   │
│  Years of Experience: [Input]       │
│  Credentials: [Text Area]           │
│  Languages: [Input]                 │
│  Availability: [Text Area]          │
│                                     │
│  [Save Changes Button]              │
└─────────────────────────────────────┘
```

---

## Phase 5: Add Profile Edit Link to Doctor Dashboard

### Update `DoctorDashboard.jsx`

Add a "Edit Profile" button/tab that navigates to `/doctor/profile/edit`

---

## Implementation Steps

### Step 1: Database Migration
```bash
cd backend
node add-doctor-profile-fields.js
```

### Step 2: Update Backend Controllers
- Update `getApprovedDoctors` to include new fields
- Create `updateDoctorProfile` endpoint
- Create `uploadProfilePhoto` endpoint
- Add routes for new endpoints

### Step 3: Update Frontend
- Update `ProfessionalsPage.jsx` to fetch from API
- Create `DoctorProfileEdit.jsx` component
- Add route for profile edit page
- Add "Edit Profile" link in doctor dashboard

### Step 4: Testing
- Test approved doctors display
- Test profile editing
- Test photo upload
- Test data persistence

---

## API Endpoints Needed

### GET /api/doctors/approved
- Returns all approved doctors with full profile info
- Public endpoint (no auth required)

### GET /api/doctors/profile/:id
- Returns specific doctor profile
- Public endpoint

### PUT /api/doctors/profile
- Updates logged-in doctor's profile
- Requires doctor authentication

### POST /api/doctors/profile/photo
- Uploads profile photo
- Requires doctor authentication

---

## Database Fields Summary

| Field | Type | Description |
|-------|------|-------------|
| profile_photo | VARCHAR(500) | Path to profile photo |
| bio | TEXT | Doctor's bio/description |
| session_fee | DECIMAL(10,2) | Fee per session |
| rating | DECIMAL(3,2) | Average rating (0-5) |
| review_count | INTEGER | Number of reviews |
| years_experience | INTEGER | Years of experience |
| credentials | TEXT | Professional credentials |
| languages | VARCHAR(255) | Languages spoken |
| availability_hours | TEXT | Available hours/days |

---

## Next Steps

Would you like me to:
1.  Create the database migration script
2.  Update the backend controllers
3.  Create the Doctor Profile Edit component
4.  Update the Professionals page to fetch real data

Let me know and I'll implement this step by step!
