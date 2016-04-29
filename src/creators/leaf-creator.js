export const createLeaf = function ({ scene, position, rotation, length, bottomRadius, topRadius }) {

    let leafShape = new THREE.Shape();
    leafShape.moveTo(0, 6);
    leafShape.lineTo(3, 0);
    leafShape.lineTo(-3, 0);
    leafShape.lineTo(0, 6);

    let leafGeometry = new THREE.ShapeGeometry( leafShape );
    let leafMesh = new THREE.Mesh( leafGeometry,
        new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            color: "white"
        })
    )

    leafMesh.position.set(position.x, position.y, position.z);
    leafMesh.rotation.set(rotation.x, rotation.y, rotation.z);

    scene.add(leafMesh);
}

