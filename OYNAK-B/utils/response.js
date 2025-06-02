exports.error = (res, message = "Xatolik", status = 400) => {
  return res.status(status).json({ success: false, message });
};

exports.success = (res, data = {}, message = "OK") => {
  return res.status(200).json({ success: true, message, data });
};
