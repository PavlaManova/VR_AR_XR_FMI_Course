/**
 * FMI VR/AR/XR Library
 * 2022-02-25
 * v 0.001
 *
 * vaxInit()
 *
 */


var renderer, scene, camera, light, stats, t, animate;


function vaxInit()
{
	renderer = new THREE.WebGLRenderer( {antialias: true} );
	document.body.appendChild( renderer.domElement );
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';
	
	stats = new Stats();
	document.body.appendChild( stats.dom );
	
	scene = new THREE.Scene();
	scene.background = new THREE.Color('white');

	camera = new THREE.PerspectiveCamera( 60, 1, 1, 1000 );
	camera.position.set(0,0,100);
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	light = new THREE.PointLight();
	light.position.set(0,150,300);
	scene.add( light );
	
	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();
	
	renderer.setAnimationLoop( frame );
}


function onWindowResize( event )
{
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight, true );
}			


function frame( time )
{
	if (animate) animate( time/1000 );
	
	stats.update();
	
	renderer.render( scene, camera );
}

