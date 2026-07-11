import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  uploadEndpoint: string;
  uploadFolder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  uploadEndpoint,
  uploadFolder = "playzone",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (uploadFolder) {
        formData.append('folder', uploadFolder);
      }

      // Use customFetch with credentials to include session cookies
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${uploadEndpoint}`, {
        method: 'POST',
        credentials: 'include', // Include cookies for session-based auth
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error('Falha ao fazer upload da imagem');
      }

      const data = await response.json();
      
      // The response should have url and publicId from Cloudinary
      const imageUrl = data.url || data.imageUrl;
      const publicId = data.publicId;

      if (imageUrl) {
        setPreview(imageUrl);
        onChange(imageUrl, publicId);
      } else {
        throw new Error('URL da imagem não encontrada na resposta');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload da imagem. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Trocar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={cn(
            "aspect-video w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
            disabled
              ? "border-white/5 bg-muted/30 cursor-not-allowed"
              : "border-white/20 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Fazendo upload...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Clique para fazer upload da imagem
              </p>
              <p className="text-xs text-muted-foreground/60">
                PNG, JPG até 5MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
