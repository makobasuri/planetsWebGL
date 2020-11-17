import * as THREE from '../node_modules/three/src/three.js'

const renderer = new THREE.WebGLRenderer( { antialias: true } );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );

const planet = new THREE.SphereGeometry(0.5, 128, 128)
const planetTexture = new THREE.TextureLoader().load('../saturnmap.jpg')
const planetMaterial = new THREE.MeshPhongMaterial({
  map: planetTexture,
  bumpMap	: planetTexture,
  bumpScale: 0.002,
})

const saturnMesh = new THREE.Mesh(planet, planetMaterial);

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 )


const _RingGeometry = function ( innerRadius, outerRadius, thetaSegments ) {

	THREE.Geometry.call( this )

	let normal	= new THREE.Vector3( 0, 0, 1 )

	for(var i = 0; i < thetaSegments; i++ ){
		var angleLo	= (i / thetaSegments) *Math.PI*2
		var angleHi	= ((i+1) / thetaSegments) *Math.PI*2

		var vertex1	= new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
		var vertex2	= new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
		var vertex3	= new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
		var vertex4	= new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

		this.vertices.push( vertex1 );
		this.vertices.push( vertex2 );
		this.vertices.push( vertex3 );
		this.vertices.push( vertex4 );


		var vertexIdx	= i * 4;

		// Create the first triangle
		var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
		var uvs = []

		var uv = new THREE.Vector2(0, 0)
		uvs.push(uv)
		var uv = new THREE.Vector2(1, 0)
		uvs.push(uv)
		var uv = new THREE.Vector2(0, 1)
		uvs.push(uv)

		this.faces.push(face);
		this.faceVertexUvs[0].push(uvs);

		// Create the second triangle
		var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
		var uvs = []

		var uv = new THREE.Vector2(0, 1)
		uvs.push(uv)
		var uv = new THREE.Vector2(1, 0)
		uvs.push(uv)
		var uv = new THREE.Vector2(1, 1)
		uvs.push(uv)

		this.faces.push(face);
		this.faceVertexUvs[0].push(uvs);
	}

	this.center();
	this.computeFaceNormals();

  this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), outerRadius );

}

_RingGeometry.prototype = Object.create( THREE.Geometry.prototype );

const ring = new _RingGeometry(0.58, 0.76, 128)
const ringMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load('../saturnringtexture.jpeg'),
  // side: THREE.DoubleSide,
  // color: 0xffffff,
  transparent: true,
  opacity: 0.8,
})
const shadowRingMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load('../saturnringtexture.jpeg'),
  side: THREE.DoubleSide,
  // color: 0xffffff,
  transparent: true,
  opacity: 0,
})

const ringMesh	= new THREE.Mesh(ring, ringMaterial)
const shadowRing = new THREE.Mesh(ring, shadowRingMaterial)

init();
animate();

function init() {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.position.z = 1;

    // const ambientLight = new THREE.AmbientLight( 0x222222 )

    // scene.add( ambientLight )

    directionalLight.position.set(5,5,5)

    scene.add( directionalLight )

    directionalLight.castShadow	= true
    directionalLight.shadow.camera.near	= 0.01
    directionalLight.shadow.camera.far	= 15
    directionalLight.shadow.camera.fov	= 45

    directionalLight.shadow.camera.left	= -1
    directionalLight.shadow.camera.right	=  1
    directionalLight.shadow.camera.top	=  1
    directionalLight.shadow.camera.bottom= -1

    directionalLight.shadow.bias	= 0.001
    directionalLight.shadow.darkness	= 0.2

    directionalLight.shadow.mapSize.width	= 1024
    directionalLight.shadow.mapSize.height	= 1024

    saturnMesh.castShadow = true
    saturnMesh.receiveShadow = true
    saturnMesh.rotateX(0.2)
    saturnMesh.rotateZ(0.24)
    scene.add( saturnMesh );

    ringMesh.lookAt(new THREE.Vector3(-1.5,6,1))
    ringMesh.castShadow = true
    ringMesh.receiveShadow = true

    shadowRing.lookAt(new THREE.Vector3(-1.5,6,1))
    shadowRing.translateZ(-0.01)
    shadowRing.castShadow = true
    shadowRing.receiveShadow = false

    scene.add(ringMesh)
    scene.add(shadowRing)

    document.body.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    // camera.rotation.z += 0.004;
    saturnMesh.rotation.y += 0.0001;
    ringMesh.rotation.z += 0.001;
    renderer.render( scene, camera );
}
