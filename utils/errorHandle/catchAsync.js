const catchAsync = (cb) => {
    return (req, res, next) => {
      cb(req, res, next).catch((err) => {
        return next(err);
      });
    };
  };
  
  module.exports = catchAsync;
  