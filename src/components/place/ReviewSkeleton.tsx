import React from "react";
import { Box, Skeleton, Divider } from "@mui/material";

interface ReviewSkeletonProps {
  count?: number;
}

const ReviewSkeleton: React.FC<ReviewSkeletonProps> = ({ count = 3 }) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        maxHeight: 160,
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        pr: 1,
        "&::-webkit-scrollbar": {
          width: 6,
          backgroundColor: "rgba(0,0,0,0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: 3,
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.3)",
          },
        },
        "&::-webkit-scrollbar-track": {
          borderRadius: 3,
        },
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            mb: index < count - 1 ? 1 : 0,
          }}
        >
          {/* Rating y usuario skeleton */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Skeleton variant="rectangular" width={80} height={16} />
            <Skeleton variant="text" width={60} height={12} />
          </Box>

          {/* Texto de reseña skeleton */}
          <Skeleton
            variant="text"
            width="100%"
            height={12}
            sx={{ fontSize: "0.8rem" }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height={12}
            sx={{ fontSize: "0.8rem" }}
          />

          {index < count - 1 && <Divider sx={{ mt: 1, opacity: 0.3 }} />}
        </Box>
      ))}
    </Box>
  );
};

export default ReviewSkeleton;
