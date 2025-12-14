import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import {
  postSchema,
  validateFileSize,
  validateFileType,
} from "../lib/validators";
import { postAPI } from "../api/endpoints";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const CreatePost = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postSchema),
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileType(file)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    if (!validateFileSize(file)) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("postImage", imageFile);
    if (data.caption) formData.append("caption", data.caption);

    try {
      setUploadProgress(10);
      await postAPI.createPost(formData);
      setUploadProgress(100);
      toast.success("Post created successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create post");
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-4 px-4">
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <button onClick={() => navigate(-1)} className="text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-semibold text-lg">Create new post</h2>
          <div className="w-6"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-4">
            <div>
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Click to upload image</p>
                  <p className="text-gray-400 text-xs mt-1">
                    JPG, PNG or WEBP (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-70"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div>
              <textarea
                {...register("caption")}
                placeholder="Write a caption..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              {errors.caption && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.caption.message}
                </p>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !imageFile}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
