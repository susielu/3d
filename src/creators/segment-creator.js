import { createLeaf }            from './leaf-creator'


const droopySegmentCreator = function ({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition }) {
  debugger;
};

const defaultSegmentCreator = function ({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition }) {
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

  const onEnd = () => {
    return defaultSegmentCreator({ lengthProducer, materials, scene, segment : newRecursiveSegment, minimumRadius, leafThreshold, transition })
  };

  if (Math.random() < newRecursiveSegment.branchProbability) {
    let newBranchSegment = Object.assign({}, segment);
    newBranchSegment.position = localPosition;
    newBranchSegment.rotation = localRotation;
    newBranchSegment.rotation.x += Math.random() > 0.5 ? Math.PI : -Math.PI
    newBranchSegment.rotation.y += Math.random() > 0.5 ? Math.PI : -Math.PI
    newBranchSegment.rotation.z += Math.random() > 0.5 ? Math.PI : -Math.PI
    newBranchSegment.rotation.normalize();

    // TODO: update position due to rotation effects here?
   return {
      func: transition(cylinder, 'scale', onEnd),
      new: [defaultSegmentCreator({ lengthProducer, materials, scene, segment : newBranchSegment, minimumRadius, leafThreshold, transition })]
    }
  } else {
      return transition(cylinder, 'scale', onEnd);
  }

}

const creatorMap = {
  default: defaultSegmentCreator,
  droopy: droopySegmentCreator
}

const createSegment = function ({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition, segmentType }) {
  return creatorMap[segmentType]({ lengthProducer, materials, scene, segment, minimumRadius, leafThreshold, transition });
};


export { createSegment as beginCreatingSegments }
