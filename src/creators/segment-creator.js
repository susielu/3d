import { createLeaf }            from './leaf-creator'

const createSegment = function ({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, segmentList }) {

  if (segment.radius < minimumRadius) {
    return;
  }

  let localPosition = new THREE.Vector3();
  localPosition.copy(segment.position);
  let localRotation = new THREE.Vector3();
  localRotation.copy(segment.rotation);

  let materialIndex = Math.min(Math.floor(segment.radius), materials[segment.color].length - 1 );
  let material = materials[segment.color][materialIndex];
  let topRadius = segment.radius * segment.sizeReduction;
  let length = lengthProducer();

  let geometry = new THREE.CylinderGeometry(
    topRadius,
    segment.radius,
    length,
    10
  );

  if (segment.radius < leafThreshold){
    createLeaf({
      scene,
      position: localPosition,
      rotation: segment.rotation,
      length,
      bottomRadius: segment.radius,
      topRadius})
  }

  let cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.x = localPosition.x;
  cylinder.position.y = localPosition.y;
  cylinder.position.z = localPosition.z;

  cylinder.rotation.x = segment.rotation.x;
  cylinder.rotation.y = segment.rotation.y;
  cylinder.rotation.z = segment.rotation.z;

  cylinder.scale.x = 0.01;
  cylinder.scale.y = 0.01;
  cylinder.scale.z = 0.01;

  scene.add(cylinder);

  segmentList.push(cylinder);

  let newRecursiveSegment = Object.assign({}, segment);
  newRecursiveSegment.radius = topRadius;
  newRecursiveSegment.position = localPosition;
  newRecursiveSegment.rotation = localRotation;

  let updateVector = new THREE.Vector3(0,1,0);
  let rotationMatrix = new THREE.Matrix4();
  let euler = new THREE.Euler();
  euler.setFromVector3(newRecursiveSegment.rotation, 'XYZ');
  rotationMatrix.makeRotationFromEuler(euler);
  updateVector.transformDirection(rotationMatrix);
  updateVector.multiplyScalar(length);

  newRecursiveSegment.position.add(updateVector);

  createSegment({ lengthProducer, materials, scene, segment : newRecursiveSegment, minimumRadius, leafThreshold, segmentList });

  if (Math.random() < newRecursiveSegment.branchProbability) {

    let newBranchSegment = Object.assign({}, segment);
    newBranchSegment.position = localPosition;
    newBranchSegment.rotation = localRotation;
    newBranchSegment.rotation.x += Math.random() - 0.5;
    newBranchSegment.rotation.y += Math.random() - 0.5;
    newBranchSegment.rotation.z += Math.random() - 0.5;
    newBranchSegment.rotation.normalize();

    // TODO: update position due to rotation effects here?
    createSegment({ lengthProducer, materials, scene, segment : newBranchSegment, minimumRadius, leafThreshold, segmentList });
  }
}

export { createSegment as beginCreatingSegments }
