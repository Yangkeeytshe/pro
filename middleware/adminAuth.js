// Toggle User Active/Inactive Status
exports.toggleUserStatus = (req, res) => {
  const userId = req.params.id;

  db.query("SELECT status FROM users WHERE id = ?", [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching user status:", err);
      return res.status(500).send("Server error");
    }

    const currentStatus = results[0].status;
    const newStatus = currentStatus ? 0 : 1;

    db.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, userId], (err, result) => {
      if (err) {
        console.error("Error updating user status:", err);
        return res.status(500).send("Update failed");
      }

      res.redirect("/adminManageUser");
    });
  });
};
