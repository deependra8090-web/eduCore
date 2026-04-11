import express from "express";
import { login,logout,signup } from "../controller/admin.controller.js";
import { updateCourse, deleteCourse } from "../controller/course.controller.js";
import adminMiddleware from "../middleware/admin.mid.js";
import userMiddleware from "../middleware/user.middleware.js";


const router = express.Router();


const isAuthenticated = userMiddleware;
const isAdmin = adminMiddleware;

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.put("/update-course/:id", isAuthenticated, isAdmin, updateCourse);
router.delete("/delete/:id", adminMiddleware, deleteCourse);


export default router;