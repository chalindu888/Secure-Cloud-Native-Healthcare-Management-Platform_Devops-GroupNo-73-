// Admin panel data: live counts, every registered user, suspending / reactivating accounts, and an
// activity trail built from real events (registrations, admissions, and admin actions).

// Ids of suspended accounts, kept in memory so a suspended user's still-valid token is refused at once
export const suspendedUserIds = new Set();

export const initAdminTables = async (pool) => {
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      actor_email VARCHAR(255) NOT NULL,
      action VARCHAR(50) NOT NULL,
      target TEXT NOT NULL,
      severity VARCHAR(10) NOT NULL DEFAULT 'info',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  const suspended = await pool.query('SELECT id FROM users WHERE is_active = FALSE');
  suspendedUserIds.clear();
  suspended.rows.forEach((r) => suspendedUserIds.add(r.id));
};

export const registerAdminRoutes = (app, pool, { authenticate, requireRole }) => {
  const admin = [authenticate, requireRole('admin')];
  const fail = (res, err) => {
    console.error(err.message);
    res.status(500).json({ error: 'A server error occurred.' });
  };

  // Headline numbers for the dashboard
  app.get('/api/admin/overview', ...admin, async (_req, res) => {
    try {
      const [roles, apts, today, beds, admitted, ambulances, recent] = await Promise.all([
        pool.query(`SELECT role, COUNT(*)::int AS total,
                           COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS "newThisWeek",
                           COUNT(*) FILTER (WHERE is_active = FALSE)::int AS suspended
                    FROM users GROUP BY role`),
        pool.query('SELECT status, COUNT(*)::int AS total FROM appointments GROUP BY status'),
        pool.query('SELECT COUNT(*)::int AS total FROM appointments WHERE appointment_date = CURRENT_DATE AND status <> \'cancelled\''),
        pool.query('SELECT COALESCE(SUM(beds), 0)::int AS total FROM rooms'),
        pool.query("SELECT COUNT(*)::int AS total FROM admissions WHERE status = 'admitted'"),
        pool.query(`SELECT COUNT(*)::int AS total,
                           (SELECT COUNT(*)::int FROM ambulance_requests WHERE status IN ('requested', 'accepted', 'on_the_way')) AS "activeTrips"
                    FROM ambulances`),
        pool.query(`SELECT id, name, email, role, created_at AS "createdAt"
                    FROM users WHERE role IN ('patient', 'doctor', 'ambulance')
                    ORDER BY created_at DESC, id DESC LIMIT 8`),
      ]);

      const byRole = {};
      roles.rows.forEach((r) => { byRole[r.role] = r; });
      const byStatus = {};
      apts.rows.forEach((r) => { byStatus[r.status] = r.total; });

      res.json({
        users: {
          total: roles.rows.reduce((n, r) => n + r.total, 0),
          byRole,
          suspended: roles.rows.reduce((n, r) => n + r.suspended, 0),
        },
        appointments: {
          total: Object.values(byStatus).reduce((n, v) => n + v, 0),
          byStatus,
          today: today.rows[0].total,
        },
        hospital: { totalBeds: beds.rows[0].total, admitted: admitted.rows[0].total },
        ambulances: ambulances.rows[0],
        recentUsers: recent.rows,
      });
    } catch (err) {
      fail(res, err);
    }
  });

  // Everyone who has registered (never the password or photo)
  app.get('/api/admin/users', ...admin, async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active AS "isActive", u.created_at AS "createdAt",
               u.blood_group AS "bloodGroup", u.specialty, u.department, u.license,
               (u.photo IS NOT NULL) AS "hasPhoto",
               a.ambulance_number AS "ambulanceNumber", a.vehicle_number AS "vehicleNumber",
               CASE u.role
                 WHEN 'patient' THEN (SELECT COUNT(*)::int FROM appointments x WHERE x.patient_id = u.id)
                 WHEN 'doctor' THEN (SELECT COUNT(*)::int FROM appointments x WHERE x.doctor_id = u.id)
                 ELSE 0
               END AS "appointmentCount"
        FROM users u
        LEFT JOIN ambulances a ON a.user_id = u.id
        ORDER BY u.created_at DESC, u.id DESC
        LIMIT 2000`);
      res.json({ users: result.rows });
    } catch (err) {
      fail(res, err);
    }
  });

  app.patch('/api/admin/users/:id', ...admin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (!Number.isInteger(userId) || typeof req.body.isActive !== 'boolean') {
        return res.status(400).json({ error: 'Please choose a user and a status.' });
      }
      if (userId === req.user.id) return res.status(400).json({ error: 'You cannot suspend your own account.' });

      const found = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
      const target = found.rows[0];
      if (!target) return res.status(404).json({ error: 'User not found.' });
      if (target.role === 'admin') return res.status(400).json({ error: 'Administrator accounts cannot be suspended here.' });

      await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [req.body.isActive, userId]);
      if (req.body.isActive) suspendedUserIds.delete(userId); else suspendedUserIds.add(userId);
      await pool.query(
        'INSERT INTO audit_logs (actor_email, action, target, severity) VALUES ($1, $2, $3, $4)',
        [req.user.email, req.body.isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED', `${target.name || target.email} (${target.email}, ${target.role})`, 'warning']
      );
      res.json({ message: req.body.isActive ? 'Account reactivated.' : 'Account suspended.', isActive: req.body.isActive });
    } catch (err) {
      fail(res, err);
    }
  });

  // Newest first: admin actions, new registrations and hospital admissions
  app.get('/api/admin/audit-logs', ...admin, async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM (
          SELECT 'a' || id AS id, created_at AS timestamp, actor_email AS actor, action, target, severity FROM audit_logs
          UNION ALL
          SELECT 'u' || id, created_at, email, 'USER_REGISTERED',
                 COALESCE(name, email) || ' registered as ' || role, 'info'
          FROM users
          UNION ALL
          SELECT 'm' || ad.id, ad.admitted_at, COALESCE(d.email, 'doctor'), 'PATIENT_ADMITTED',
                 p.name || ' admitted to room ' || rm.code || ', bed ' || ad.bed_no || ' (' || ad.admission_number || ')', 'success'
          FROM admissions ad JOIN users p ON p.id = ad.patient_id LEFT JOIN users d ON d.id = ad.doctor_id JOIN rooms rm ON rm.id = ad.room_id
          UNION ALL
          SELECT 'd' || ad.id, ad.discharged_at, COALESCE(d.email, 'doctor'), 'PATIENT_DISCHARGED',
                 p.name || ' discharged (' || ad.admission_number || ')', 'success'
          FROM admissions ad JOIN users p ON p.id = ad.patient_id LEFT JOIN users d ON d.id = ad.doctor_id
          WHERE ad.discharged_at IS NOT NULL
        ) events
        ORDER BY timestamp DESC
        LIMIT 300`);
      res.json({ logs: result.rows });
    } catch (err) {
      fail(res, err);
    }
  });
};
