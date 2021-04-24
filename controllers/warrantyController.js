const Warranty = require('./../models/warrantyModel');

exports.getAllWarranty = async (req, res) => {
  try {
    const warrantys = await Warranty.find({});
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        warranty: warrantys,
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
    const warrantys = await Warranty.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        warranty: warrantys,
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
    const warrantys = await Warranty.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        warranty: warrantys,
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
    const warrantys = await Warranty.findByIdAndDelete(req.params.id);
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
    const newWarranty = await Warranty.create(req.body);
    res.status(201).json({
      status: 'success',
      warranty: newWarranty,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Message',
    });
  }
};
