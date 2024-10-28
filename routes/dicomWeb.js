const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const dcmjs = require("dcmjs");
const devLogger = require("../logger/devLogger");
const dicomParser = require("dicom-parser");

/* GET users listing. */
router.get("/", function (req, res) {
  res.send("处理 dicom 传递的接口集");
});

// 我们能够使用 process.cwd() 去获取 进程所在的路径

const QidoSerieTagList = [
  "0020000E",
  "00080060",
  "00200011",
  // 这里我们需要重新构建
  "00201209",
  "0008103E",
];

// 获取 serieList 接口
router.get("/studies/:study/series", (req, res) => {
  const studyInstanceUID = req.params.study;
  const dcmFilePath = path.join(process.cwd(), "/public/DCM/test.DCM");
  const dcmBuffer = fs.readFileSync(dcmFilePath).buffer;
  const dicomTags = dcmjs.data.DicomMessage.readFile(dcmBuffer).dict;

  const result = QidoSerieTagList.reduce((acc, crr) => {
    return {
      ...acc,
      [crr]: {
        Value: dicomTags[crr]?.Value || [1],
      },
    };
  }, {});

  res.json([result]);
});

// 编写 metaData 的接口
router.get("/studies/:study/series/:serie/metadata", (req, res) => {
  const dcmFilePath = path.join(process.cwd(), "/public/DCM/test.DCM");
  const dcmBuffer = fs.readFileSync(dcmFilePath).buffer;
  const dicomMetaData = dcmjs.data.DicomMessage.readFile(dcmBuffer).dict;

  const metaData = {};

  // 删除 pixel data 和 不规范标签
  for (const tagKey in dicomMetaData) {
    console.log(tagKey);
    if (
      dicomMetaData[tagKey].vr !== "UN" &&
      dicomMetaData[tagKey].vr !== "OW"
    ) {
      metaData[tagKey] = {
        vr: dicomMetaData[tagKey].vr,
        Value: dicomMetaData[tagKey].Value,
      };
    } else {
      // do nothing
    }
  }

  devLogger.log("info", metaData);
  res.json([metaData]);
});

// 获取 pixelData 的接口
router.get(
  "/studies/:study/series/:series/instances/:instance/frames/:frames",
  (req, res) => {
    const dcmFilePath = path.join(process.cwd(), "/public/DCM/test.DCM");
    const dcmBuffer = fs.readFileSync(dcmFilePath);

    const dataSet = dicomParser.parseDicom(dcmBuffer);
    const pixelDataElement = dataSet.elements.x7fe00010;

    const pixelDataBuffer = Buffer.from(
      dataSet.byteArray.buffer,
      pixelDataElement.dataOffset,
      pixelDataElement.length
    );

    const { data, boundary } = dcmjs.utilities.message.multipartEncode(
      [pixelDataBuffer],
      undefined,
      "application/octet-stream"
    );

    res.setHeader("Content-Type", `multipart/related;`);
    res.setHeader("maxContentLength", Buffer.byteLength(data) + 1);

    res.send(Buffer.from(data));
  }
);

module.exports = router;
