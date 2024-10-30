import { useState, useRef, useCallback } from "react";
import { Camera, Upload, ImagePlus, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
}

export const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [ipCameraUrl, setIpCameraUrl] = useState("");
  const [isIpCameraConnected, setIsIpCameraConnected] = useState(false);

  // Handle file selection and validate file type and size
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelected(file);

    // Send file to the backend
    const formData = new FormData();
    formData.append("file", file); // Ensure 'image' matches your Django endpoint

    try {
      const response = await fetch("http://localhost:8000/api/upload/", {
  method: "POST",
  body: formData,
});


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Catch non-JSON errors
        throw new Error(`Error: ${errorData.message || "Upload failed"}`);
      }

      const data = await response.json();
      console.log(data);

      // Optional: Notify success
      toast({
        title: "Upload successful",
        description: "Image uploaded successfully!",
        variant: "success",
        style: {
          backgroundColor: "#78D69D", // Custom background color
          color: "white", // Custom text color
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);

      // Optional: Notify error
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
        style: {
          backgroundColor: "#FF0000", // Custom background color
          color: "white", // Custom text color
        },
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Connect to IP camera
  const connectToIpCamera = async () => {
    try {
      if (!ipCameraUrl) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid IP camera URL",
          variant: "destructive",
        });
        return;
      }

      // Check if the video ref is available
      if (videoRef.current) {
        // For MJPEG streams, we can use the img tag
        if (ipCameraUrl.toLowerCase().includes("mjpeg")) {
          setIsIpCameraConnected(true);
          setIsCapturing(true);
          return;
        }

        // For regular video streams
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            // @ts-ignore - Custom constraint for IP camera
            optional: [{ sourceId: ipCameraUrl }],
          },
        });

        videoRef.current.srcObject = stream;
        setIsIpCameraConnected(true);
        setIsCapturing(true);
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to IP camera. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  // Start camera for capturing
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Capture image from video
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
          handleFileSelect(file);
          stopCamera();
        }
      }, "image/jpeg");
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    setIsIpCameraConnected(false);
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? "border-medical-dark bg-medical-light/50" : "border-gray-300"}
          ${!previewUrl && !isCapturing ? "block" : "hidden"}
        `}
      >
        <div className="flex flex-col items-center space-y-4">
          <ImagePlus className="h-12 w-12 text-medical" />
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drag and drop your image here, or
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-medical-dark hover:underline ml-1"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports: JPG, PNG, WEBP (max 10MB)
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-medical hover:bg-medical-dark"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Button
          onClick={isCapturing ? captureImage : startCamera}
          className="bg-medical hover:bg-medical-dark"
        >
          <Camera className="mr-2 h-4 w-4" />
          {isCapturing ? "Capture" : "Use Camera"}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-medical text-medical-dark">
              <Wifi className="mr-2 h-4 w-4" />
              IP Camera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect to IP Camera</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="url"
                placeholder="Enter IP camera URL (e.g., http://192.168.1.100:8080/video)"
                value={ipCameraUrl}
                onChange={(e) => setIpCameraUrl(e.target.value)}
              />
              <Button onClick={connectToIpCamera} className="w-full bg-medical hover:bg-medical-dark">
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {isCapturing && (
          <Button
            onClick={stopCamera}
            variant="outline"
            className="border-medical text-medical-dark"
          >
            Cancel
          </Button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {/* Image Preview or Video Stream */}
      {previewUrl && !isCapturing && (
        <img src={previewUrl} alt="Preview" className="rounded-lg max-w-full mx-auto" />
      )}
      {isCapturing && (
        <video ref={videoRef} autoPlay playsInline className="rounded-lg max-w-full mx-auto" />
      )}
    </div>
  );
};
