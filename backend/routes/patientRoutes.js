// import express from "express";
// import { registerPatient, loginPatient } from "../controllers/patientController.js";

// const router = express.Router();

// router.post("/register", registerPatient);
// router.post("/login", loginPatient);

// export default router;







// import express from "express";
// const router = express.Router();

// // TEMP route
// router.get("/", (req, res) => {
//   res.send("Patient routes working");
// });

// export default router;




import express from "express";
import { registerPatient, loginPatient, getPatientProfile, updatePatientProfile, sendEmailVerification, verifyEmailOTP } from "../controllers/patientController.js";
import { validatePatientRegistration, validateLogin } from "../middleware/validation.js";
import { verifyToken, verifyPatient } from "../middleware/auth.js";

const router = express.Router();

// Email verification (before registration)
router.post("/send-verification", sendEmailVerification);
router.post("/verify-email", verifyEmailOTP);

// Public routes
router.post("/register", validatePatientRegistration, registerPatient);

// Protected routes
router.get("/profile", verifyToken, verifyPatient, getPatientProfile);
router.put("/profile", verifyToken, verifyPatient, updatePatientProfile);

export default router;



