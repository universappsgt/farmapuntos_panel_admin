import React, { useRef } from "react";
import { Button } from "~/components/ui/button";

interface ImageUploadProps {
  id: string;
  name: string;
  onImageUpload: (file: File) => void;
}

export function ImageUpload({ id, name, onImageUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        id={id}
        name={name}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button type="button" onClick={handleButtonClick}>
        Subir imagen
      </Button>
    </div>
  );
}
