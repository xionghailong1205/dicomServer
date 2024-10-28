const fs = require("fs");
const dicomParser = require("dicom-parser");

// 用来 mock 接口的文件的路径
const dcmFilePath =
  "/Users/xionghailong/dicomWork/dicomServer/public/DCM/test.DCM";

const dicomFileAsBuffer = fs.readFileSync(dcmFilePath);

const dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
const pixelDataElement = dataSet.elements.x7fe00010;

const pixelDataBuffer = Buffer.from(
  dataSet.byteArray.buffer,
  pixelDataElement.dataOffset,
  pixelDataElement.length
);

console.log(pixelDataBuffer.byteLength);
