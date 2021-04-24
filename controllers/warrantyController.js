const Warranty = require('./../models/warrantyModel');

exports.getAllWarranty = async (req, res) => {
  try {
    const tours = await Warranty.find();
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      messsage: err,
    });
  }
};

exports.getWarranty = async (req, res) => {
  try {
    const tours = await Warranty.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      messsage: err,
    });
  }
};

exports.updateWarranty = async (req, res) => {
  try {
    const tour = await Warranty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      messsage: err,
    });
  }
};

exports.deleteWarranty = async (req, res) => {
  try {
    const tour = await Warranty.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      messsage: err,
    });
  }
};

exports.createWarranty = async (req, res) => {
  try {
    const newTour = await Warranty.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Message',
    });
  }
};
