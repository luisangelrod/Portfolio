# Vector Hero

Original stylized masked hero, in carmine and midnight blue, with white angular lenses and titanium suit details. No copied game assets, logos, or textures. CC0-1.0.

Load **vector-hero.glb** with GLTFLoader. Scene uses meters, +Y up, +Z forward. Anatomical standing height is approximately 1.92 m; posed dimensions are in metadata.json.

The **Grip** node is fixed at local (0,0,0). Place the asset's scene/group at your simulated rope endpoint. Geometry hangs below the root. Drive global swinging motion on an outer group so the root remains the endpoint.

Play the 3.2-second **Swing** clip using THREE.AnimationMixer; normal LoopRepeat works without a discontinuity. The raised right wrist is held in place by baked two-bone IK (maximum sample error 8.998e-16 meters). The free hand, torso, head, hips, knees, and feet animate.

Named pivots: BodyRoot, Head, RightUpperArm, RightForearm, LeftUpperArm, LeftForearm, LeftHand, RightGripGlove, RightThigh, RightShin, RightFoot, LeftThigh, LeftShin, LeftFoot. This is an articulated mesh hierarchy, not a skin/skeleton; node rotations remain easy to override.

The asset has 16574 rendered triangles, 74 meshes, 8 PBR materials, no external resources, and a 150540-byte file. Use standard physically based lighting and a key light from camera-front to read the eye lenses.

~~~js
const { scene, animations } = await new GLTFLoader().loadAsync('/vector-hero.glb');
const endpoint = new THREE.Group();
world.add(endpoint);
endpoint.add(scene);
const mixer = new THREE.AnimationMixer(scene);
mixer.clipAction(THREE.AnimationClip.findByName(animations, 'Swing')).play();
// In the frame loop:
endpoint.position.copy(simulatedRopeEnd);
mixer.update(deltaSeconds);
~~~

Rebuild from the repository root with node scripts/hero-studies/build-hero.mjs. Validate with node scripts/hero-studies/validate-hero.mjs. Both use the installed Three.js dependency.
