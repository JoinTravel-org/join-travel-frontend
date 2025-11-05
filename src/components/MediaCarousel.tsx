import React, { useState } from "react";
import { Box, IconButton, MobileStepper, Paper } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import MediaViewer from "./MediaViewer";
import type { ReviewMedia } from "../types/review";

interface MediaCarouselProps {
  media: ReviewMedia[];
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ReviewMedia | null>(null);
  const maxSteps = media.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleMediaClick = (item: ReviewMedia) => {
    setSelectedMedia(item);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
  };

  const currentMedia = media[activeStep];

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          position: "relative",
          width: "100%",
          height: 200,
          borderRadius: 2,
          overflow: "hidden",
          cursor: "pointer",
          "&:hover": {
            boxShadow: 3,
          },
        }}
        onClick={() => handleMediaClick(currentMedia)}
      >
        {/* Media Display */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey.100",
          }}
        >
          {currentMedia.mimeType.startsWith("image/") ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/api/media/${
                currentMedia.id
              }`}
              alt={currentMedia.originalFilename}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : currentMedia.mimeType.startsWith("video/") ? (
            <video
              src={`${import.meta.env.VITE_BACKEND_URL}/api/media/${
                currentMedia.id
              }`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              controls
              muted
              preload="metadata"
            />
          ) : null}

          {/* Navigation Arrows */}
          {maxSteps > 1 && (
            <>
              <IconButton
                sx={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.7)",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
              </IconButton>

              <IconButton
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.7)",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={activeStep === maxSteps - 1}
              >
                <KeyboardArrowRight />
              </IconButton>
            </>
          )}

          {/* Media Counter */}
          {maxSteps > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.7)",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {activeStep + 1}/{maxSteps}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Stepper */}
      {maxSteps > 1 && (
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            mt: 1,
            bgcolor: "transparent",
            "& .MuiMobileStepper-dot": {
              bgcolor: "rgba(0,0,0,0.3)",
            },
            "& .MuiMobileStepper-dotActive": {
              bgcolor: "primary.main",
            },
          }}
          nextButton={
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              <KeyboardArrowRight />
            </IconButton>
          }
          backButton={
            <IconButton
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <KeyboardArrowLeft />
            </IconButton>
          }
        />
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          open={viewerOpen}
          onClose={handleViewerClose}
        />
      )}
    </>
  );
};

export default MediaCarousel;
