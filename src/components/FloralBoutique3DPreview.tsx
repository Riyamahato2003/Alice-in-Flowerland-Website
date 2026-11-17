import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type ArrangementForm = 'bouquet' | 'basket' | 'hatbox' | 'lace-sculpt';

export interface FloralPreviewProps {
  form: ArrangementForm;
  palette: string;
  wrappingStyle: string;
  pearlOrRibbonAccent: boolean;
}

interface PaletteSwatches {
  primaryPetal: number;
  secondaryPetal: number;
  accentPetal: number;
  ribbon: number;
  paper: number;
}

const PALETTE_MAP: Record<string, PaletteSwatches> = {
  'Blush & Pearl': {
    primaryPetal: 0xf4c2cf,
    secondaryPetal: 0xfcf7f9,
    accentPetal: 0xe39cb4,
    ribbon: 0xe7b4c4,
    paper: 0xfdfafb,
  },
  'Lavender & Lilac': {
    primaryPetal: 0xc9b8df,
    secondaryPetal: 0xfaf6fc,
    accentPetal: 0xa992cb,
    ribbon: 0xd6c4e8,
    paper: 0xf9f7fc,
  },
  'Cream Ivory & Champagne': {
    primaryPetal: 0xfbf4e9,
    secondaryPetal: 0xf3e5d2,
    accentPetal: 0xd9be90,
    ribbon: 0xc9a96e,
    paper: 0xfdfaf3,
  },
  'Pastel Rainbow Dreams': {
    primaryPetal: 0xf2bfd0,
    secondaryPetal: 0xb7d9ec,
    accentPetal: 0xcbb7e4,
    ribbon: 0xebd6df,
    paper: 0xfcf9fa,
  },
};

function getPaletteSwatches(name: string): PaletteSwatches {
  return PALETTE_MAP[name] || PALETTE_MAP['Blush & Pearl'];
}

const _vec3 = new THREE.Vector3();

function buildLayeredBloom(
  colorHex: number,
  radiusScale: number,
  petalMaterialBase: THREE.MeshPhysicalMaterial
): THREE.Group {
  const bloomGroup = new THREE.Group();
  const innerMat = petalMaterialBase.clone();
  innerMat.color.setHex(colorHex);

  const outerMat = petalMaterialBase.clone();
  outerMat.color.setHex(colorHex).offsetHSL(0, -0.04, 0.04);

  // Core spiral cup
  const coreGeo = new THREE.SphereGeometry(0.11 * radiusScale, 14, 12);
  coreGeo.scale(1, 0.78, 1);
  const core = new THREE.Mesh(coreGeo, innerMat);
  core.position.y = 0.04 * radiusScale;
  core.castShadow = true;
  bloomGroup.add(core);

  // Two rings of cupped botanical petals
  const petalGeo = new THREE.SphereGeometry(0.12 * radiusScale, 12, 10, 0, Math.PI * 0.85, 0, Math.PI * 0.85);
  petalGeo.scale(1.05, 1.25, 0.48);

  for (let ring = 0; ring < 2; ring++) {
    const count = ring === 0 ? 5 : 7;
    const dist = (ring === 0 ? 0.085 : 0.145) * radiusScale;
    const tilt = ring === 0 ? 0.48 : 0.85;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + ring * 0.35;
      const petal = new THREE.Mesh(petalGeo, ring === 0 ? innerMat : outerMat);
      petal.position.set(
        Math.cos(theta) * dist,
        0.02 * radiusScale,
        Math.sin(theta) * dist
      );
      petal.rotation.y = -theta + Math.PI * 0.5;
      petal.rotation.x = tilt;
      petal.castShadow = true;
      petal.receiveShadow = true;
      bloomGroup.add(petal);
    }
  }

  return bloomGroup;
}

export const FloralBoutique3DPreview: React.FC<FloralPreviewProps> = ({
  form,
  palette,
  wrappingStyle,
  pearlOrRibbonAccent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ form, palette, wrappingStyle, pearlOrRibbonAccent });
  const requestRenderRef = useRef<() => void>(() => {});
  const rebuildRef = useRef<() => void>(() => {});

  useEffect(() => {
    stateRef.current = { form, palette, wrappingStyle, pearlOrRibbonAccent };
    rebuildRef.current();
    requestRenderRef.current();
  }, [form, palette, wrappingStyle, pearlOrRibbonAccent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 360);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6ecef);
    scene.fog = new THREE.Fog(0xf6ecef, 6.5, 16);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);
    camera.position.set(0.25, 1.95, 4.15);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.92, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.autoRotate = false;
    controls.update();

    // 3-point Warm + Cool Boutique Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xf6f0f8, 0xe8d9d3, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.1);
    keyLight.position.set(3.2, 4.8, 3.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.2;
    keyLight.shadow.camera.right = 2.2;
    keyLight.shadow.camera.top = 2.6;
    keyLight.shadow.camera.bottom = -1.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfbe5ef, 0.85);
    rimLight.position.set(-3.0, 2.5, -2.5);
    scene.add(rimLight);

    // Subtle Atelier Marble Plinth & Contact Shadow Plane
    const plinthGeo = new THREE.CylinderGeometry(1.15, 1.2, 0.08, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xfdfafb,
      roughness: 0.72,
      metalness: 0.04,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.04;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const brassTrimGeo = new THREE.TorusGeometry(1.15, 0.012, 12, 64);
    brassTrimGeo.rotateX(Math.PI * 0.5);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc9a96e,
      roughness: 0.22,
      metalness: 0.88,
    });
    const brassTrim = new THREE.Mesh(brassTrimGeo, brassMat);
    brassTrim.position.y = 0.002;
    scene.add(brassTrim);

    const bouquetRoot = new THREE.Group();
    scene.add(bouquetRoot);

    const disposeGroupResources = (group: THREE.Group) => {
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
    };

    const rebuildArrangement = () => {
      disposeGroupResources(bouquetRoot);
      const { form: curForm, palette: curPalette, wrappingStyle: curWrap, pearlOrRibbonAccent: showPearls } =
        stateRef.current;
      const swatch = getPaletteSwatches(curPalette);

      const petalMatBase = new THREE.MeshPhysicalMaterial({
        color: swatch.primaryPetal,
        roughness: 0.58,
        metalness: 0.0,
        sheen: 0.55,
        sheenRoughness: 0.65,
        sheenColor: new THREE.Color(0xffffff),
      });

      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x748977,
        roughness: 0.68,
        metalness: 0.0,
      });

      const ribbonMat = new THREE.MeshPhysicalMaterial({
        color: swatch.ribbon,
        roughness: 0.34,
        metalness: 0.08,
        clearcoat: 0.35,
        clearcoatRoughness: 0.45,
      });

      const wrapColor = curWrap.toLowerCase().includes('hatbox')
        ? 0xf7dfe7
        : swatch.paper;
      const wrapMat = new THREE.MeshStandardMaterial({
        color: wrapColor,
        roughness: curForm === 'basket' ? 0.86 : 0.72,
        metalness: 0.02,
      });

      const pearlMat = new THREE.MeshPhysicalMaterial({
        color: 0xfefbfd,
        roughness: 0.14,
        metalness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
      });

      // 1. Primary Silhouette (Vessel / Architectural Wrapping)
      let bloomAnchorY = 1.02;
      if (curForm === 'basket') {
        const pts = [
          new THREE.Vector2(0.01, 0),
          new THREE.Vector2(0.36, 0.01),
          new THREE.Vector2(0.54, 0.32),
          new THREE.Vector2(0.62, 0.58),
          new THREE.Vector2(0.56, 0.62),
        ];
        const basketGeo = new THREE.LatheGeometry(pts, 36);
        const basketMat = new THREE.MeshStandardMaterial({
          color: 0xf7f2ed,
          roughness: 0.88,
          metalness: 0.0,
        });
        const basket = new THREE.Mesh(basketGeo, basketMat);
        basket.castShadow = true;
        basket.receiveShadow = true;
        bouquetRoot.add(basket);

        // Woven handle
        const handleGeo = new THREE.TorusGeometry(0.56, 0.032, 12, 42, Math.PI);
        const handle = new THREE.Mesh(handleGeo, basketMat);
        handle.position.y = 0.58;
        handle.castShadow = true;
        bouquetRoot.add(handle);

        // Chiffon sash
        const beltGeo = new THREE.CylinderGeometry(0.59, 0.57, 0.09, 36, 1, true);
        const belt = new THREE.Mesh(beltGeo, ribbonMat);
        belt.position.y = 0.52;
        bouquetRoot.add(belt);
        bloomAnchorY = 0.76;
      } else if (curForm === 'hatbox') {
        const boxGeo = new THREE.CylinderGeometry(0.46, 0.45, 0.72, 40);
        const boxMesh = new THREE.Mesh(boxGeo, wrapMat);
        boxMesh.position.y = 0.36;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        bouquetRoot.add(boxMesh);

        const rimGeo = new THREE.TorusGeometry(0.462, 0.014, 12, 48);
        rimGeo.rotateX(Math.PI * 0.5);
        const rimMesh = new THREE.Mesh(rimGeo, brassMat);
        rimMesh.position.y = 0.71;
        bouquetRoot.add(rimMesh);

        const ribbonBandGeo = new THREE.CylinderGeometry(0.466, 0.466, 0.11, 40, 1, true);
        const ribbonBand = new THREE.Mesh(ribbonBandGeo, ribbonMat);
        ribbonBand.position.y = 0.52;
        bouquetRoot.add(ribbonBand);
        bloomAnchorY = 0.88;
      } else if (curForm === 'lace-sculpt') {
        const urnPts = [
          new THREE.Vector2(0.01, 0),
          new THREE.Vector2(0.28, 0.01),
          new THREE.Vector2(0.14, 0.18),
          new THREE.Vector2(0.12, 0.42),
          new THREE.Vector2(0.42, 0.74),
          new THREE.Vector2(0.45, 0.88),
        ];
        const urnGeo = new THREE.LatheGeometry(urnPts, 36);
        const urn = new THREE.Mesh(urnGeo, wrapMat);
        urn.castShadow = true;
        urn.receiveShadow = true;
        bouquetRoot.add(urn);

        // Scalloped lace collar ruffles
        for (let i = 0; i < 12; i++) {
          const theta = (i / 12) * Math.PI * 2;
          const ruffleGeo = new THREE.CircleGeometry(0.22, 16, 0, Math.PI * 1.15);
          const ruffle = new THREE.Mesh(ruffleGeo, wrapMat);
          ruffle.position.set(Math.cos(theta) * 0.4, 0.92, Math.sin(theta) * 0.4);
          ruffle.rotation.y = -theta + Math.PI * 0.5;
          ruffle.rotation.x = 0.58;
          bouquetRoot.add(ruffle);
        }
        bloomAnchorY = 0.96;
      } else {
        // Signature Architectural Bouquet Cone + Sculpted Collar Sheets
        const conePts = [
          new THREE.Vector2(0.06, 0.01),
          new THREE.Vector2(0.13, 0.36),
          new THREE.Vector2(0.5, 0.98),
          new THREE.Vector2(0.64, 1.24),
        ];
        const coneGeo = new THREE.LatheGeometry(conePts, 36);
        const cone = new THREE.Mesh(coneGeo, wrapMat);
        cone.castShadow = true;
        cone.receiveShadow = true;
        bouquetRoot.add(cone);

        // Winged Korean paper folds around collar
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + 0.25;
          const wingGeo = new THREE.CylinderGeometry(0.32, 0.12, 0.56, 16, 1, true, -0.7, 1.4);
          const wing = new THREE.Mesh(wingGeo, wrapMat);
          wing.position.set(Math.cos(angle) * 0.24, 1.04, Math.sin(angle) * 0.24);
          wing.rotation.y = -angle;
          wing.rotation.z = -0.22;
          wing.castShadow = true;
          bouquetRoot.add(wing);
        }
        bloomAnchorY = 1.06;
      }

      // 2. Signature Satin Ribbon Bow & Flowing Tails
      const bowGroup = new THREE.Group();
      const bowY = curForm === 'basket' ? 0.52 : curForm === 'hatbox' ? 0.52 : 0.64;
      const bowZ = curForm === 'basket' ? 0.58 : curForm === 'hatbox' ? 0.47 : 0.3;
      bowGroup.position.set(0, bowY, bowZ);

      const loopGeo = new THREE.TorusGeometry(0.11, 0.03, 10, 24);
      loopGeo.scale(1.5, 0.85, 0.55);
      const leftLoop = new THREE.Mesh(loopGeo, ribbonMat);
      leftLoop.position.set(-0.11, 0.02, 0);
      leftLoop.rotation.z = 0.25;
      leftLoop.castShadow = true;
      bowGroup.add(leftLoop);

      const rightLoop = new THREE.Mesh(loopGeo, ribbonMat);
      rightLoop.position.set(0.11, 0.02, 0);
      rightLoop.rotation.z = -0.25;
      rightLoop.castShadow = true;
      bowGroup.add(rightLoop);

      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), ribbonMat);
      knot.scale.set(1, 0.9, 0.75);
      bowGroup.add(knot);

      // Gold heart charm in center when ribbon accented or basket
      if (showPearls || curForm === 'basket') {
        const charm = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 16), brassMat);
        charm.rotation.x = Math.PI * 0.5;
        charm.position.set(0, -0.02, 0.042);
        bowGroup.add(charm);
      }

      for (const side of [-1, 1]) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(side * 0.08, -0.18, 0.04),
          new THREE.Vector3(side * 0.14, -0.4, 0.02),
        ]);
        const tailGeo = new THREE.TubeGeometry(curve, 14, 0.024, 6, false);
        tailGeo.scale(1.4, 1, 0.35);
        const tail = new THREE.Mesh(tailGeo, ribbonMat);
        tail.castShadow = true;
        bowGroup.add(tail);
      }
      bouquetRoot.add(bowGroup);

      // 3. Sage Foliage & Eucalyptus Sprays
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const leafGeo = new THREE.SphereGeometry(0.11, 10, 8);
        leafGeo.scale(0.55, 1.35, 0.22);
        const leaf = new THREE.Mesh(leafGeo, foliageMat);
        const radius = 0.44 + (i % 2) * 0.08;
        leaf.position.set(
          Math.cos(a) * radius,
          bloomAnchorY + 0.06 + (i % 3) * 0.04,
          Math.sin(a) * radius
        );
        leaf.rotation.y = -a + Math.PI * 0.5;
        leaf.rotation.x = 0.95;
        leaf.castShadow = true;
        bouquetRoot.add(leaf);
      }

      // 4. Layered Botanical Blooms Cluster (Center Hero Peony + 8 Surrounding Roses/Ranunculus/Tulips)
      const heroColorList = [
        swatch.primaryPetal,
        swatch.secondaryPetal,
        swatch.accentPetal,
        swatch.primaryPetal,
        swatch.secondaryPetal,
        swatch.accentPetal,
        swatch.primaryPetal,
        swatch.secondaryPetal,
        swatch.accentPetal,
      ];

      const placements: [number, number, number, number][] = [
        [0, bloomAnchorY + 0.24, 0, 1.28],
        [0.26, bloomAnchorY + 0.14, 0.15, 1.0],
        [-0.25, bloomAnchorY + 0.16, 0.17, 1.05],
        [0.06, bloomAnchorY + 0.15, 0.28, 0.98],
        [-0.08, bloomAnchorY + 0.14, -0.26, 0.95],
        [0.34, bloomAnchorY + 0.06, -0.14, 0.88],
        [-0.33, bloomAnchorY + 0.07, -0.16, 0.88],
        [0.2, bloomAnchorY + 0.08, -0.28, 0.85],
        [-0.2, bloomAnchorY + 0.28, -0.05, 0.82],
      ];

      placements.forEach(([x, y, z, scale], idx) => {
        const bloom = buildLayeredBloom(heroColorList[idx % heroColorList.length], scale, petalMatBase);
        bloom.position.set(x, y, z);
        _vec3.set(x, bloomAnchorY - 0.35, z);
        bloom.lookAt(x * 1.4, y + 0.55, z * 1.4);
        bouquetRoot.add(bloom);
      });

      // 5. Optional Pearl Strands & Floating Droplets
      if (showPearls) {
        for (let strand = 0; strand < 2; strand++) {
          const offset = strand * Math.PI * 0.85 - 0.42;
          for (let p = 0; p < 7; p++) {
            const t = p / 6;
            const angle = offset + (t - 0.5) * 1.1;
            const drop = Math.sin(t * Math.PI) * 0.18;
            const r = curForm === 'basket' ? 0.58 : 0.44;
            const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), pearlMat);
            pearl.position.set(
              Math.cos(angle) * r,
              bloomAnchorY - 0.06 - drop,
              Math.sin(angle) * r
            );
            bouquetRoot.add(pearl);
          }
        }
      }
    };

    rebuildRef.current = rebuildArrangement;
    rebuildArrangement();

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty && !disposed) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    requestRenderRef.current = requestRender;

    const handleControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('change', handleControlsChange);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', handleControlsChange);
      controls.dispose();
      disposeGroupResources(bouquetRoot);
      plinthGeo.dispose();
      plinthMat.dispose();
      brassTrimGeo.dispose();
      brassMat.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-[4/5] bg-[#F6ECEF] border border-[#2A1E24]/12 overflow-hidden select-none">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D floral bouquet preview — drag to rotate"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-[#FCF9FA]/92 border-t border-[#2A1E24]/10 text-[11px] text-[#74626A]">
        <span className="uppercase tracking-[0.16em] text-[#9E4764]">
          3D Atelier Silhouette
        </span>
        <span>Drag to inspect · {palette}</span>
      </div>
    </div>
  );
};
