// import express from "express";
// import { registerDoctor, loginDoctor } from "../controllers/doctorController.js";

// const router = express.Router();

// router.post("/register", registerDoctor);
// router.post("/login", loginDoctor);

// export default router;






// import express from "express";
// const router = express.Router();

// router.get("/", (req, res) => {
//   res.send("Doctor routes working");
// });

// export default router;







// import express from "express";
// import { registerDoctor, loginDoctor } from "../controllers/doctorController.js";

// const router = express.Router();

// router.post("/register", registerDoctor);
// router.post("/login", loginDoctor);

// export default router;


import express from "express";
import { 
  registerDoctor, 
  loginDoctor, 
  getDoctorProfile, 
  updateDoctorProfile, 
  getApprovedDoctors,
  updateDoctorProfileInfo,
  uploadProfilePhoto,
  getDoctorById,
  updateCompleteProfile
} from "../controllers/doctorController.js";
import { validateDoctorRegistration, validateLogin } from "../middleware/validation.js";
import { verifyToken, verifyDoctor } from "../middleware/auth.js";
import { uploadDocument, uploadProfileImage, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// Public routes - specific routes MUST come before dynamic routes
router.post("/register", uploadDocument, handleUploadError, validateDoctorRegistration, registerDoctor);
// router.post("/login", validateLogin, loginDoctor); // Disabled - using unified auth
router.get("/approved", getApprovedDoctors); // For patients to browse doctors

// Protected routes - specific routes BEFORE dynamic routes
router.get("/profile", verifyToken, verifyDoctor, getDoctorProfile);
router.put("/profile", verifyToken, verifyDoctor, updateDoctorProfile);
router.put("/profile/info", verifyToken, verifyDoctor, updateDoctorProfileInfo);
router.put("/profile/complete", verifyToken, verifyDoctor, updateCompleteProfile);
router.post("/profile/photo", verifyToken, verifyDoctor, uploadProfileImage, handleUploadError, uploadProfilePhoto);

// Dynamic routes - MUST be last
router.get("/:doctorId", getDoctorById); // Get single doctor for booking page

export default router;

