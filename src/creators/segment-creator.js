import { createLeaf }            from './leaf-creator'

const defaultAngleChanger = function(angle) {
  let newRotation = new THREE.Vector3();
  newRotation.copy(angle);
  newRotation.x += Math.random() > 0.5 ? Math.PI : -Math.PI
  newRotation.y += Math.random() > 0.5 ? Math.PI : -Math.PI
  newRotation.z += Math.random() > 0.5 ? Math.PI : -Math.PI
  newRotation.normalize();
  return newRotation;
}

const droopyAngleChanger = function(angle) {
  let newRotation = new THREE.Vector3();
  newRotation.copy(angle);
  newRotation.x += Math.random() > 0.5 ? Math.PI : -Math.PI
  newRotation.z += Math.random() > 0.5 ? Math.PI : -Math.PI
  newRotation.normalize();
  return newRotation;
}

const defaultSegmentCreator = function ({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition, angleChanger }) {
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
    5
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

  cylinder.rotation.x = localRotation.x;
  cylinder.rotation.y = localRotation.y
  cylinder.rotation.z = localRotation.z
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  cylinder.scale.y = 0.1;

  scene.add(cylinder);

  let newRecursiveSegment = Object.assign({}, segment);
  newRecursiveSegment.radius = topRadius;
  newRecursiveSegment.position.copy(localPosition);
  newRecursiveSegment.rotation.copy(localRotation);

  let updateVector = new THREE.Vector3(0,1,0);
  let rotationMatrix = new THREE.Matrix4();
  let euler = new THREE.Euler();
  euler.setFromVector3(newRecursiveSegment.rotation, 'XYZ');
  rotationMatrix.makeRotationFromEuler(euler);
  updateVector.transformDirection(rotationMatrix);
  updateVector.multiplyScalar(length);

  newRecursiveSegment.position.add(updateVector);

  const onEnd = () => {
    return defaultSegmentCreator({ lengthProducer, materials, scene, segment : newRecursiveSegment, minimumRadius, leafThreshold, transition, angleChanger })
  };

  if (Math.random() < newRecursiveSegment.branchProbability) {
    let newBranchSegment = Object.assign({}, segment);
    newBranchSegment.position = localPosition;
    newBranchSegment.rotation = angleChanger(localRotation);

    // TODO: update position due to rotation effects here?
   return {
      func: transition(cylinder, 'scale', onEnd),
      new: [defaultSegmentCreator({ lengthProducer, materials, scene, segment : newBranchSegment, minimumRadius, leafThreshold, transition, angleChanger })]
    }
  } else {
      return transition(cylinder, 'scale', onEnd);
  }

}

const createSegment = function ({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition, segmentType }) {
  if (segmentType == 'droopy') {
    return defaultSegmentCreator({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition, angleChanger: droopyAngleChanger });
  } else {
    return defaultSegmentCreator({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition, angleChanger: defaultAngleChanger });
  }
};


export { createSegment as beginCreatingSegments }
