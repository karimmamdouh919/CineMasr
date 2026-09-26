import { snackModel } from '../../db/models/snack.model.js';

export const getAllSnacks = async (req, res) => {
  try {
    const snacks = await snackModel.find();
    res.json({ success: true, data: snacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSnack = async (req, res) => {
  try {
    const snack = await snackModel.create(req.body);
    res.status(201).json({ success: true, data: snack });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSnack = async (req, res) => {
  try {
    const snack = await snackModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!snack) return res.status(404).json({ success: false, message: 'Snack not found' });
    res.status(200).json({ success: true, data: snack });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSnack = async (req, res) => {
  try {
    const snack = await snackModel.findByIdAndDelete(req.params.id);
    if (!snack) return res.status(404).json({ success: false, message: 'Snack not found' });
    res.status(200).json({ success: true, message: 'Snack deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};