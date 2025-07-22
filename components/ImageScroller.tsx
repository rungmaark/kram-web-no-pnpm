// components/ImageScroller.tsx

"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function ImageScroller({ imageUrls }: { imageUrls: string[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [emblaRef] = useEmblaCarousel({ dragFree: true, skipSnaps: true });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (viewportRef.current) emblaRef(viewportRef.current);
  }, [emblaRef]);

  return (
    <>
      <div className="mt-3 w-full overflow-hidden">
        <div
          className="overflow-x-auto overflow-y-hidden hide-scrollbar"
          ref={viewportRef}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-3 cursor-pointer">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 1}`}
                draggable={false}
                onClick={() => setLightboxIndex(index)}
                className="rounded-lg object-cover min-h-[300px] max-h-[375px] w-auto flex-shrink-0 select-none"
              />
            ))}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          open={lightboxIndex !== null}
          close={() => setLightboxIndex(null)}
          index={lightboxIndex}
          slides={imageUrls.map((url) => ({ src: url }))}
          render={{
            slide: ({ slide }) => (
              <div className="w-full h-full flex justify-center items-center bg-black">
                <img
                  src={slide.src}
                  alt=""
                  className="object-contain"
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    minWidth: "300px", // ✅ ขนาดขั้นต่ำที่ต้องการ
                    minHeight: "200px",
                  }}
                />
              </div>
            ),
          }}
        />
      )}
    </>
  );
}
