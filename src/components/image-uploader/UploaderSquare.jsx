// UploaderSquare.jsx
import React, { useEffect, useState, useRef } from "react";
import { t } from "i18next";
import { useDropzone } from "react-dropzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FiUploadCloud, FiXCircle } from "react-icons/fi";
import AvatarEditor from "react-avatar-editor"; // ייבוא של ספריית חיתוך תמונות

// internal imports
import useAsync from "@/hooks/useAsync";
import { notifyError, notifySuccess } from "@/utils/toast";
import Container from "@/components/image-uploader/Container";
import requests from "@/services/httpService";
import DriveImg from "./DriveImg";
import notifyApiResponse from "@/utils/notifyApiResponse";

// ייבוא handleFileUpload הממירה ודוחסת תמונות ל-WebP
import handleFileUpload from "@/utils/convertImageToWebP";

const UploaderSquare = ({ setImageUrl, imageUrl, product, folder }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const [cropImage, setCropImage] = useState(null); // משתנה לאחסון התמונה לחיתוך
  const editorRef = useRef(null); // רפרנס לקומפוננטת AvatarEditor

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"]
    },
    multiple: product ? true : false,
    // maxSize: 1000000, // 1MB
    maxFiles: 2,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      );
      // נבחרת התמונה הראשונה לחיתוך
      setCropImage(acceptedFiles[0]);
    },
  });

  // ניקוי זיכרון עבור התצוגה המקדימה
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // פונקציה להעלאת התמונה החתוכה לאחר עריכה, דחיסה והמרה ל-WebP
  const handleUploadCroppedImage = async () => {
    if (editorRef.current) {
      editorRef.current.getImageScaledToCanvas().toBlob(async (blob) => {
        // יצירת קובץ (File) מה-Blob
        const croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });

        try {
          // העברת הקובץ לפונקציה handleFileUpload לקבלת קובץ מומר (WebP ודחוס)
          const [convertedFile] = await handleFileUpload([croppedFile]);
          const formData = new FormData();
          formData.append("file", convertedFile);
          formData.append("folder", folder);

          setLoading(true);
          setError("Uploading....");

          requests.post(`/upload`, formData)
            .then((res) => {
              notifySuccess("Image Uploaded successfully!");
              setLoading(false);
              if (product) {
                setImageUrl((imgUrl) => [...imgUrl, res.link]);
              } else {
                setImageUrl(res.link);
              }
            })
            .catch((err) => {
              console.error("Upload error", err);
              notifyApiResponse(err, false);
              setLoading(false);
            });
        } catch (error) {
          console.error("Error during image conversion", error);
          notifyError("Image conversion failed!");
        }
      }, "image/jpeg");
    }
  };

  // פונקציה להסרת תמונה (ללא חיתוך)
  const handleRemoveImage = async (img) => {
    try {
      setLoading(false);
      notifyError("Image deleted successfully!");
      if (product) {
        const result = imageUrl?.filter((i) => i !== img);
        setImageUrl(result);
      } else {
        setImageUrl("");
      }
    } catch (err) {
      console.error("Remove error", err);
      notifyApiResponse(err, false);
      setLoading(false);
    }
  };

  // תצוגה מקדימה של הקבצים
  const thumbs = files.map((file) => (
    <div key={file.name}>
      <div>
        <DriveImg
          className={`inline-flex border rounded-md w-24 max-h-24 p-2`}
          src={file.preview}
          alt={file.name}
        />
      </div>
    </div>
  ));

  return (
    <div className="w-full text-center">
      <div
        className="border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer px-6 pt-5 pb-6"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <span className="mx-auto flex justify-center">
          <FiUploadCloud className="text-3xl text-mainColor" />
        </span>
        <p className="text-sm mt-2 dark:text-white">{t("DragYourImage")}</p>
        <em className="text-xs text-gray-400">{t("imageFormat")}</em>
      </div>

      {cropImage && (
        <div className="my-4">
          {/* AvatarEditor להצגת ממשק חיתוך */}
          <AvatarEditor
            ref={editorRef} // הגדרת רפרנס עבור קומפוננטה זו
            image={cropImage} // התמונה לחיתוך
            width={250} // רוחב של החיתוך
            height={250} // גובה של החיתוך (ליצירת ריבוע)
            border={50} // מרווח מסביב לחיתוך
            borderRadius={0} // 0 למצב ריבוע
            scale={1.2} // קביעת זום
            rotate={0} // ללא סיבוב
          />
          <button
            className="mt-4 px-4 py-2 bg-mainColor text-white rounded"
            onClick={handleUploadCroppedImage}
          >
            {t("Upload Cropped Image")}
          </button>
        </div>
      )}

      <div className="text-mainColor">{loading && err}</div>
      <aside className="flex flex-row flex-wrap mt-4">
        {product ? (
          <DndProvider backend={HTML5Backend}>
            <Container
              setImageUrl={setImageUrl}
              imageUrl={imageUrl}
              handleRemoveImage={handleRemoveImage}
            />
          </DndProvider>
        ) : !product && imageUrl ? (
          <div className="relative">
            <DriveImg
              className="inline-flex border rounded-md w-24 max-h-24 p-2"
              src={imageUrl}
              alt="Image"
            />
            <button
              type="button"
              className="absolute top-0 right-0 text-red-500 focus:outline-none"
              onClick={() => handleRemoveImage(imageUrl)}
            >
              <FiXCircle />
            </button>
          </div>
        ) : (
          thumbs
        )}
      </aside>
    </div>
  );
};

export default UploaderSquare;
