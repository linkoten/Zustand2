"use client";

import { Button } from "@/components/ui/button";
import { Link, Mail } from "lucide-react";
import { toast } from "sonner";
import { FaFacebookF, FaLinkedin, FaTwitter } from "react-icons/fa";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}
export default function ShareButtons({
  title,
  url,
  description,
}: ShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description || title);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papiers");
    } catch (error) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="text-blue-500 hover:text-blue-600"
      >
        <FaTwitter className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("facebook")}
        className="text-blue-600 hover:text-blue-700"
      >
        <FaFacebookF className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("linkedin")}
        className="text-blue-700 hover:text-blue-800"
      >
        <FaLinkedin className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("email")}
        className="text-gray-600 hover:text-gray-700"
      >
        <Mail className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="text-gray-600 hover:text-gray-700"
      >
        <Link className="w-4 h-4" />
      </Button>
    </div>
  );
}
