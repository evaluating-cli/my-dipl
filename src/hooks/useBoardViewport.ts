import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject, type WheelEvent as ReactWheelEvent } from "react";

export const BASE_VIEWPORT = { width: 920, height: 820 } as const;
export const MAP_CENTER = { x: 450, y: 400 } as const;
export const ZOOM_BOUNDS = { min: 0.75, max: 3.5 } as const;
export const PAN_BOUNDS = { x: 550, y: 450 } as const;
export const KEYBOARD_PAN_INCREMENT = 60;

const DRAG_THRESHOLD = 4;
const CLICK_SUPPRESSION_MS = 120;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type Point = { x: number; y: number };

interface BoardViewport {
  containerRef: RefObject<HTMLDivElement | null>;
  zoomScale: number;
  viewBox: string;
  isDragging: boolean;
  handlePointerDown: (event: ReactPointerEvent) => void;
  handleWheel: (event: ReactWheelEvent) => void;
  shouldSuppressClick: () => boolean;
}

export function useBoardViewport(): BoardViewport {
  const [zoomScale, setZoomScaleState] = useState(1);
  const [panOffset, setPanOffsetState] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const zoomScaleRef = useRef(zoomScale);
  const panOffsetRef = useRef(panOffset);
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef<Point>({ x: 0, y: 0 });
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const ignoreClickRef = useRef(false);

  const setZoomScale = useCallback((value: number) => {
    zoomScaleRef.current = value;
    setZoomScaleState(value);
  }, []);

  const setPanOffset = useCallback((value: Point) => {
    panOffsetRef.current = value;
    setPanOffsetState(value);
  }, []);

  const constrainPan = useCallback((point: Point): Point => ({
    x: clamp(point.x, -PAN_BOUNDS.x, PAN_BOUNDS.x),
    y: clamp(point.y, -PAN_BOUNDS.y, PAN_BOUNDS.y),
  }), []);

  const handleZoomIn = useCallback(() => {
    setZoomScale(clamp(Number((zoomScaleRef.current * 1.25).toFixed(2)), ZOOM_BOUNDS.min, ZOOM_BOUNDS.max));
  }, [setZoomScale]);

  const handleZoomOut = useCallback(() => {
    setZoomScale(clamp(Number((zoomScaleRef.current / 1.25).toFixed(2)), ZOOM_BOUNDS.min, ZOOM_BOUNDS.max));
  }, [setZoomScale]);

  const handleResetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [setPanOffset, setZoomScale]);

  const handlePointerDown = useCallback((event: ReactPointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = { ...panOffsetRef.current };
  }, []);

  useEffect(() => {
    let clickSuppressionTimeout: ReturnType<typeof setTimeout> | undefined;

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerDownRef.current || !containerRef.current) return;
      const dx = event.clientX - pointerStartRef.current.x;
      const dy = event.clientY - pointerStartRef.current.y;

      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
        setIsDragging(true);
      }

      if (!hasDraggedRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const svgWidth = BASE_VIEWPORT.width / zoomScaleRef.current;
      const svgHeight = BASE_VIEWPORT.height / zoomScaleRef.current;
      const renderedScale = Math.max(rect.width / svgWidth, rect.height / svgHeight);
      setPanOffset(constrainPan({
        x: panStartRef.current.x - dx / renderedScale,
        y: panStartRef.current.y - dy / renderedScale,
      }));
    };

    const handlePointerUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      setIsDragging(false);
      if (hasDraggedRef.current) {
        ignoreClickRef.current = true;
        clearTimeout(clickSuppressionTimeout);
        clickSuppressionTimeout = setTimeout(() => {
          ignoreClickRef.current = false;
        }, CLICK_SUPPRESSION_MS);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      clearTimeout(clickSuppressionTimeout);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [constrainPan, setPanOffset]);

  const handleWheel = useCallback((event: ReactWheelEvent) => {
    event.preventDefault();
    if (!containerRef.current) return;

    const currentZoom = zoomScaleRef.current;
    const currentPan = panOffsetRef.current;
    const zoomFactor = event.deltaY < 0 ? 1.15 : 0.87;
    const newScale = clamp(Number((currentZoom * zoomFactor).toFixed(2)), ZOOM_BOUNDS.min, ZOOM_BOUNDS.max);
    if (newScale === currentZoom) return;

    const rect = containerRef.current.getBoundingClientRect();
    const svgWidth = BASE_VIEWPORT.width / currentZoom;
    const svgHeight = BASE_VIEWPORT.height / currentZoom;
    const renderedScale = Math.max(rect.width / svgWidth, rect.height / svgHeight);
    const cropX = (svgWidth * renderedScale - rect.width) / 2;
    const cropY = (svgHeight * renderedScale - rect.height) / 2;
    const pointerSvgX = (event.clientX - rect.left + cropX) / renderedScale;
    const pointerSvgY = (event.clientY - rect.top + cropY) / renderedScale;
    const viewX = MAP_CENTER.x + currentPan.x - svgWidth / 2;
    const viewY = MAP_CENTER.y + currentPan.y - svgHeight / 2;
    const mapPointerX = viewX + pointerSvgX;
    const mapPointerY = viewY + pointerSvgY;
    const newSvgWidth = BASE_VIEWPORT.width / newScale;
    const newSvgHeight = BASE_VIEWPORT.height / newScale;
    const newViewX = mapPointerX - (pointerSvgX / svgWidth) * newSvgWidth;
    const newViewY = mapPointerY - (pointerSvgY / svgHeight) * newSvgHeight;

    setZoomScale(newScale);
    setPanOffset(constrainPan({
      x: newViewX + newSvgWidth / 2 - MAP_CENTER.x,
      y: newViewY + newSvgHeight / 2 - MAP_CENTER.y,
    }));
  }, [constrainPan, setPanOffset, setZoomScale]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "+" || event.key === "=") handleZoomIn();
      else if (event.key === "-" || event.key === "_") handleZoomOut();
      else if (event.key === "0" || event.key === "r" || event.key === "R") handleResetZoom();
      else if (event.key === "ArrowLeft") setPanOffset(constrainPan({ ...panOffsetRef.current, x: panOffsetRef.current.x - KEYBOARD_PAN_INCREMENT / zoomScaleRef.current }));
      else if (event.key === "ArrowRight") setPanOffset(constrainPan({ ...panOffsetRef.current, x: panOffsetRef.current.x + KEYBOARD_PAN_INCREMENT / zoomScaleRef.current }));
      else if (event.key === "ArrowUp") setPanOffset(constrainPan({ ...panOffsetRef.current, y: panOffsetRef.current.y - KEYBOARD_PAN_INCREMENT / zoomScaleRef.current }));
      else if (event.key === "ArrowDown") setPanOffset(constrainPan({ ...panOffsetRef.current, y: panOffsetRef.current.y + KEYBOARD_PAN_INCREMENT / zoomScaleRef.current }));
      else return;
      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [constrainPan, handleResetZoom, handleZoomIn, handleZoomOut, setPanOffset]);

  const currentWidth = BASE_VIEWPORT.width / zoomScale;
  const currentHeight = BASE_VIEWPORT.height / zoomScale;
  const viewBox = `${MAP_CENTER.x + panOffset.x - currentWidth / 2} ${MAP_CENTER.y + panOffset.y - currentHeight / 2} ${currentWidth} ${currentHeight}`;

  return {
    containerRef,
    zoomScale,
    viewBox,
    isDragging,
    handlePointerDown,
    handleWheel,
    shouldSuppressClick: () => ignoreClickRef.current,
  };
}
