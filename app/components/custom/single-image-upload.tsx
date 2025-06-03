import { useState, useRef, useEffect } from "react";
import { Upload, Trash2, ImagePlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

interface SingleImageUploadProps {
  id: string;
  name: string;
  onImageUpload: (file: File | null) => void;
  className?: string;
  helpText?: string;
  initialImageUrl?: string;
}

export function SingleImageUpload({
  id,
  name,
  onImageUpload,
  className,
  helpText = "Sube una imagen (máx 3MB)",
  initialImageUrl,
}: SingleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentImageUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndHandleFile = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`El archivo ${file.name} excede el límite de 3MB`, {
        duration: 3000,
        className: "bg-background border-destructive",
        position: "bottom-right",
        icon: "❌",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(`El archivo ${file.name} no es una imagen válida`, {
        duration: 3000,
        className: "bg-background border-destructive",
        position: "bottom-right",
        icon: "❌",
      });
      return;
    }

    setImageFile(file);
    onImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (droppedFiles.length > 0) {
      validateAndHandleFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndHandleFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setCurrentImageUrl(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleButtonClick();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
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
            aria-label="Image upload"
          />

          <div className="space-y-4">
            {(imageFile || currentImageUrl) && (
              <div className="relative group aspect-square">
                <img
                  src={
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : currentImageUrl || ""
                  }
                  alt="Imagen seleccionada"
                  className="w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
                {imageFile && (
                  <div className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/60 px-2 py-1 rounded">
                    {(imageFile.size / (1024 * 1024)).toFixed(1)}MB
                  </div>
                )}
              </div>
            )}

            {!imageFile && !currentImageUrl && (
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
                      Arrastra tu imagen aquí o haz clic para subir
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {helpText}
                    </p>
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
                    Seleccionar Imagen
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
