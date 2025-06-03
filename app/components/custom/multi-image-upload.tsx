import { useState, useRef } from "react";
import { Upload, Trash2, ImagePlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

interface MultiImageUploadProps {
  id: string;
  name: string;
  label?: string;
  imageFiles: File[];
  onImagesChange: (files: File[]) => void;
  className?: string;
  helpText?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  id,
  name,
  label,
  imageFiles,
  onImagesChange,
  className,
  helpText = "Upload your images (max 3MB each)",
  maxImages = 5,
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndHandleFiles = (files: File[]) => {
    const remainingSlots = maxImages - imageFiles.length;

    if (remainingSlots <= 0) {
      toast.error(
        `Maximum ${maxImages} image${maxImages > 1 ? "s" : ""} allowed`,
        {
          duration: 3000,
          className: "bg-background border-destructive",
          position: "bottom-right",
          icon: "❌",
        }
      );
      return;
    }

    const validFiles = Array.from(files)
      .slice(0, remainingSlots)
      .filter((file) => {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`File ${file.name} exceeds 3MB limit`, {
            duration: 3000,
            className: "bg-background border-destructive",
            position: "bottom-right",
            icon: "❌",
          });
          return false;
        }
        return file.type.startsWith("image/");
      });

    if (validFiles.length > 0) {
      onImagesChange([...imageFiles, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    validateAndHandleFiles(droppedFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      validateAndHandleFiles(Array.from(files));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newImages = [...imageFiles];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleButtonClick();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Card
        className={cn(
          "relative overflow-hidden transition-colors",
          isDragging && "border-primary/50 bg-muted/80"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            name={name}
            id={id}
            multiple={maxImages > 1}
            aria-label="Image upload"
          />

          <div className="space-y-4">
            {imageFiles.length > 0 && (
              <div
                className={cn(
                  "grid gap-4",
                  maxImages === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                )}
              >
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/60 px-2 py-1 rounded">
                      {(file.size / (1024 * 1024)).toFixed(1)}MB
                    </div>
                  </div>
                ))}
              </div>
            )}

            {imageFiles.length < maxImages && (
              <div
                className={cn(
                  "w-full rounded-md flex flex-col items-center justify-center gap-4 border-2 border-dashed transition-colors cursor-pointer p-6",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20 bg-muted/50 hover:bg-muted/80"
                )}
                onClick={handleContainerClick}
                role="button"
                tabIndex={0}
                aria-label="Click to upload image"
              >
                <div className="flex flex-col items-center gap-2">
                  <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-medium">
                      Drop your image{maxImages > 1 ? "s" : ""} here or click to
                      upload
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {helpText}
                    </p>
                    {maxImages > 1 && (
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {imageFiles.length} of {maxImages} images uploaded
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image{maxImages > 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
