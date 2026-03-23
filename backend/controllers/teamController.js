const Team = require('../models/Team');
const User = require('../models/User');

// Get All Teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('members', 'name avatar role status')
      .populate('lead', 'name avatar');
    
    res.json({ success: true, data: { teams } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Team (Admin)
exports.createTeam = async (req, res) => {
  try {
    const { name, description, lead, color, icon } = req.body;
    
    const team = await Team.create({
      name,
      description,
      lead,
      color,
      icon
    });

    res.status(201).json({ success: true, data: { team } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Team Detail
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name avatar role status lastSeen')
      .populate('lead', 'name avatar');
    
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    
    res.json({ success: true, data: { team } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Team (Admin)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: { team } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Members to Team
exports.addMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    team.members.push(...memberIds);
    await team.save();

    // Update users' team field
    await User.updateMany(
      { _id: { $in: memberIds } },
      { team: team._id }
    );

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
