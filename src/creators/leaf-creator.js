export const createLeaf = function ({ scene, position, rotation, length, bottomRadius, topRadius }) {

    let leafShape = new THREE.Shape();
    leafShape.moveTo(0, 6);
    leafShape.lineTo(2, 2);
    leafShape.lineTo(0, 0);
    leafShape.lineTo(-2, 2);
    leafShape.lineTo(0, 6);

    let leafGeometry = new THREE.ShapeGeometry( leafShape );
    let leafMesh = new THREE.Mesh( leafGeometry,
      new THREE.MeshStandardMaterial( {
        color: "#05ffa6",
        emissive: "#9b4b9b",
        roughness: 1,
        metalness: 0,
        emissiveIntensity: 1,
        side: THREE.DoubleSide
      })
    )

    const rotationCopy = Object.assign({}, rotation);


    leafMesh.position.set(position.x, position.y, position.z);
    leafMesh.rotation.set(rotationCopy.x, rotationCopy.y, rotationCopy.z);
    leafMesh.rotation.x += Math.random()*2 - 1;
    leafMesh.rotation.y += Math.random()*2 - 1;
    leafMesh.rotation.z += Math.random()*2 - 1;
    const scale = Math.max(bottomRadius, .65)
    leafMesh.scale.set(scale, scale, scale)


    leafMesh.castShadow = true;
    leafMesh.receiveShadow = true;

    scene.add(leafMesh);
}

