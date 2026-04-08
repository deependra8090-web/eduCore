import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";

function UpdateCourse() {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔹 Fetch Course Data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await axios.get(
          `${BACKEND_URL}/course/${id}`,
          { withCredentials: true }
        );

        console.log("API RESPONSE:", data);

        // ✅ Handle both response formats
        const course = data?.course || data;

        setTitle(course?.title || "");
        setDescription(course?.description || "");
        setPrice(course?.price || "");
        setImage(course?.image?.url || "");
        setImagePreview(course?.image?.url || "");

        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch course data");
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  // 🔹 Handle Image Change
  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
  };

  // 🔹 Handle Update
 const handleUpdateCourse = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);

  // ✅ Only send if new file selected
  if (image instanceof File) {
    formData.append("image", image);
  }

  const admin = JSON.parse(localStorage.getItem("admin"));
  const token = admin?.token;

  if (!token) {
    toast.error("Please login as admin");
    return;
  }

  try {
    const response = await axios.put(
      `${API_BASE}/admin/update-course/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    toast.success(response.data.message || "Course updated successfully");
    navigate("/admin/our-courses");

  } catch (error) {
    console.error("UPDATE ERROR:", error.response?.data || error);
    toast.error(error?.response?.data?.error || "Update failed");
  }
};
  // 🔹 Loading State
  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-8">Update Course</h3>

        <form onSubmit={handleUpdateCourse} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-lg mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-lg mb-2">Course Image</label>

            <div className="flex justify-center mb-3">
              <img
                src={imagePreview || "/imgPL.webp"}
                alt="Course"
                className="w-full max-w-sm rounded-md"
              />
            </div>

            <input
              type="file"
              onChange={changePhotoHandler}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Course
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateCourse;