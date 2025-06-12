import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig, getCurve } from '../utils';
import {
  Vector3,
  TubeGeometry,
  ColorRepresentation,
  Color,
  Curve,
  BufferAttribute // NEW: Import BufferAttribute
} from 'three';
import { useStore } from '../store';
import { ThreeEvent } from '@react-three/fiber';

// NEW: Define segment constants for reuse
const TUBULAR_SEGMENTS = 20;
const RADIAL_SEGMENTS = 5;

export interface LineProps {
  animated?: boolean;
  sourceColor?: ColorRepresentation; // NEW: Use sourceColor
  targetColor?: ColorRepresentation; // NEW: Use targetColor
  curved: boolean;
  curve: Curve<Vector3>;
  id: string;
  opacity?: number;
  size?: number;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onContextMenu?: () => void;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  curveOffset?: number;
}

export const Line: FC<LineProps> = ({
  curveOffset,
  animated,
  sourceColor = '#fff', // NEW: Default source color
  targetColor = '#fff', // NEW: Default target color
  curve,
  curved = false,
  id,
  opacity = 1,
  size = 1,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const tubeRef = useRef<TubeGeometry | null>(null);
  const isDragging = useStore(state => state.draggingIds.length > 0);
  const center = useStore(state => state.centerPosition);
  const mounted = useRef<boolean>(false);

  // NEW: Memoize both source and target THREE.Color objects
  const threeSourceColor = useMemo(() => new Color(sourceColor), [sourceColor]);
  const threeTargetColor = useMemo(() => new Color(targetColor), [targetColor]);

  const { lineOpacity } = useSpring({
    from: { lineOpacity: 0 },
    to: { lineOpacity: opacity },
    config: { ...animationConfig, duration: animated ? undefined : 0 }
  });

  useSpring(() => {
    const from = curve.getPoint(0);
    const to = curve.getPoint(1);
    return {
      from: {
        fromVertices: !mounted.current && center ? [center.x, center.y, center.z] : [from.x, from.y, from.z],
        toVertices: !mounted.current && center ? [center.x, center.y, center.z] : [to.x, to.y, to.z]
      },
      to: {
        fromVertices: [from.x, from.y, from.z],
        toVertices: [to.x, to.y, to.z]
      },
      onChange: event => {
        if (!tubeRef.current) return;

        const { fromVertices, toVertices } = event.value;
        const fromVector = new Vector3(...fromVertices);
        const toVector = new Vector3(...toVertices);

        const animatedCurve = getCurve(fromVector, 0, toVector, 0, curved, curveOffset);
        const newGeometry = new TubeGeometry(animatedCurve, TUBULAR_SEGMENTS, size / 2, RADIAL_SEGMENTS, false);

        // --- NEW: Gradient Logic ---
        // Create the color buffer attribute for the new geometry before we copy it.
        const numVertices = newGeometry.attributes.position.count;
        const colors = new Float32Array(numVertices * 3);
        const color = new Color(); // Create one color object to reuse in the loop

        for (let i = 0; i <= TUBULAR_SEGMENTS; i++) {
          const t = i / TUBULAR_SEGMENTS; // Normalized position along the tube
          color.copy(threeSourceColor).lerp(threeTargetColor, t);

          // Apply the interpolated color to all vertices in this "ring" of the tube
          for (let j = 0; j <= RADIAL_SEGMENTS; j++) {
            const vertexIndex = i * (RADIAL_SEGMENTS + 1) + j;
            if (vertexIndex < numVertices) {
              colors.set([color.r, color.g, color.b], vertexIndex * 3);
            }
          }
        }
        newGeometry.setAttribute('color', new BufferAttribute(colors, 3));
        // --- End of Gradient Logic ---

        // Copy the new geometry (with its color attribute) to our ref
        tubeRef.current.copy(newGeometry);
        newGeometry.dispose();
      },
      config: {
        ...animationConfig,
        duration: animated && !isDragging ? undefined : 0
      }
    };
    // The dependency array correctly includes the color objects
  }, [animated, isDragging, curve, size, curved, curveOffset, threeSourceColor, threeTargetColor]);

  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <mesh
      userData={{ id, type: 'edge' }}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      onPointerDown={event => {
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu?.();
        }
      }}
    >
      <tubeGeometry ref={tubeRef} />
      <a.meshBasicMaterial
        opacity={lineOpacity}
        fog={true}
        transparent={true}
        depthTest={false}
        vertexColors={true} // --- NEW: Enable vertex colors ---
      />
    </mesh>
  );
};