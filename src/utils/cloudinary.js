import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded on Cloudinary: File src:" + response.url);

    //Once uploaded to CLOUDINARY, delete from our server
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    //if something wrong in uploading to Cloudinary, remove this file from local-storage as well
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
