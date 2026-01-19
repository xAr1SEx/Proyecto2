import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { Typography, Box } from "@mui/material";

interface ImageGalleryProps {
  images?: string[];
}

export const ImageGallery = ({ images = [] }: ImageGalleryProps) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Imágenes
      </Typography>
      <ImageList
        sx={{ width: "100%", height: 450 }}
        variant="quilted"
        cols={4}
        rowHeight={121}
      >
        {images.map((image, index) => (
          <ImageListItem key={index} cols={1} rows={1}>
            <img
              src={image}
              alt={`Imagen ${index + 1}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};
