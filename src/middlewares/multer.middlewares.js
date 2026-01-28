import multer from "multer";

//allow disk-storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = "aa";
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
});
