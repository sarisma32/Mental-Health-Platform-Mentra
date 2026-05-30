// Simple fix for the doctors endpoint
export const getApprovedDoctorsSimple = async (req, res) => {
  try {
    const query = `
      SELECT id, full_name, email, specialization, hospital_name, location,
             experience, bio, profile_photo, session_fee, years_experience,
             phone_number, created_at
      FROM doctors 
      WHERE approval_status = 'approved' AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query);

    res.json({
      success: true,
      doctors: result.rows,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalDoctors: result.rows.length,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (error) {
    console.error('Error fetching approved doctors:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors.",
      error: error.message
    });
  }
};