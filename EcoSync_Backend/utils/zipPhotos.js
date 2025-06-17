const archiver = require('archiver');
const path = require('path');

module.exports = function zipPhotos(deviceId, res) {
  const folderPath = path.join(__dirname, '..', 'uploads', deviceId, 'photo');
  const archive = archiver('zip');

  res.attachment(`fotos_${deviceId}.zip`);
  archive.pipe(res);
  archive.directory(folderPath, false);
  archive.finalize();
};
