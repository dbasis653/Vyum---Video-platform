import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  //validation
  //see previousn project MrManager for better validation
  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(404, "Please provide Fullname");
  }

  //if user already exist
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
    //search username or email to find the user
  });

  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  //handle the IMAGES
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  //upload image in cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // let coverImage = "";

  // if (coverImageLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // }
  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar uploaded", avatar);
  } catch (error) {
    console.log("Error uploading avatar", error);
    throw new ApiError(500, "Avatar image failed to upload");
  }

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log("Cover Image uploaded", coverImage);
  } catch (error) {
    console.log("Error uploading Cover Image", error);
    throw new ApiError(500, "Cover image failed to upload");
  }

  //construct a USER
  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    //verify if the user is created or not
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    //it means createdUser will have all the field except "-password -refreshToken"
    if (!createdUser) {
      throw new ApiError(404, "Something went wrong while creating a user");
    }

    res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.log("User failed to create");
    console.error("CREATE USER ERROR:", error);

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(500, "User not created and Images are deleted");
  }
});

export { registerUser };
