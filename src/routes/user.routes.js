import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
// import loginUser from "../controllers/user.controller.js";
// import logoutUser from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

userRouter.route("/current-user").get(verifyJWT, getCurrentUser);

userRouter.route("/update/account-details").post(verifyJWT, updateAccountDetails);

userRouter.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

userRouter.route("/update/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

userRouter.route("/channel/:username").get(verifyJWT,getUserChannelProfile);

userRouter.route("/history").get(verifyJWT, getWatchHistory);

export default userRouter;
