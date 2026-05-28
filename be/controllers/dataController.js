import Data from '../models/Data.js';

/**
 * @desc    Get data for logged in user
 * @route   GET /api/data
 * @access  Private
 */
export const getData = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const data = await Data.find({ user: req.user.id });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new data
 * @route   POST /api/data
 * @access  Private
 */
export const createData = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validate request body
    if (!title || !description) {
      res.status(400);
      throw new Error('Please add a title and description field');
    }

    // Create the data associated with the logged-in user
    const data = await Data.create({
      title,
      description,
      user: req.user.id,
    });

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update data
 * @route   PUT /api/data/:id
 * @access  Private
 */
export const updateData = async (req, res, next) => {
  try {
    const data = await Data.findById(req.params.id);

    if (!data) {
      res.status(404);
      throw new Error('Data not found');
    }

    // Make sure user owns data
    if (data.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedData = await Data.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete data
 * @route   DELETE /api/data/:id
 * @access  Private
 */
export const deleteData = async (req, res, next) => {
  try {
    const data = await Data.findById(req.params.id);

    if (!data) {
      res.status(404);
      throw new Error('Data not found');
    }

    // Make sure user owns data
    if (data.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await data.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

