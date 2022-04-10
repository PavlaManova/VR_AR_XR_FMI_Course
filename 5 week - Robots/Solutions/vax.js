/**
 * FMI VR/AR/XR Library
 * 2022-03-09
 * v 0.003
 *
 * vaxInit()		инициализира моно режим и поддържа
 *					анимационен цикъл с animate()
 *
 * vaxSceneInit()	инициализира и създава сцена със земя
 *
 * animate(t)		потребителска функция, която генерира нов
 *					кадър; извиква се автоматично
 *
 * pillar(center, material) създава пилон с връх center,
 *              	материал и стигащ надолу до y=0
 *
 * robotMaterial	подразбиращ се материал за елемент на робот
 *
 * robotElement( sizeX, sizeY, sizeZ, parent ) създава елемент
 * 				на робот, свързан към ротителски елемент
 * 
 */


var renderer, scene, camera, light, stats, t, animate;


function vaxInit()
{
	renderer = new THREE.WebGLRenderer( {antialias: true} );
	document.body.appendChild( renderer.domElement );
	document.body.style.margin = 0;
	document.body.style.overflow = 'hidden';
	
	// включва статистика, само ако е дефиниран Stats
	if( typeof Stats != 'undefined'	)
	{
		stats = new Stats();
		document.body.appendChild( stats.dom );
	}
	
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


var oldTime = 0;
var accTime = 0;
function frame( time )
{
	// защита от прекалено голяма скорост, при по-бързи компютри някои анимации
	// ще са прекалено бързи, затова изкуствено се забавя до 60 fps
	accTime += time-oldTime;
	oldTime = time;
	if( accTime < 1000/60 ) return;
	accTime = 0;
	
	if( animate ) animate( time/1000 );
	
	stats?.update();
	
	renderer.render( scene, camera );
}


// Общи настройки на сцената
function vaxSceneInit()
{
	vaxInit();
	
	// включваме сенки
	renderer.shadowMap.enabled = true;
				
	// фиксирана гледна точка
	camera.position.set( 0, 100, 150 );
	camera.lookAt( new THREE.Vector3(0,20,0) );

	// наличната светлина я правим по-слаба
	light.intensity = 0.75;
	
	// околна светлина за по-бледи сенки
	ambientLight = new THREE.AmbientLight('gold',0.25);
	scene.add( ambientLight );
	
	// прожекторна светлина за сенки
	spotLight = new THREE.SpotLight('white',0.5,0,1.0,1.0);
	spotLight.shadow.mapSize = new THREE.Vector2( 1024*2, 1024*2 );
	spotLight.position.set( 0, 100, 0 );
	spotLight.target = new THREE.Object3D();
	spotLight.castShadow = true;
	scene.add( spotLight );
	scene.add( spotLight.target );

	// земя
	ground = new THREE.Mesh(
		new THREE.BoxBufferGeometry(300,4,300),
		new THREE.MeshPhongMaterial({color:'lightgreen'})
	);
	ground.position.set( 0, -2, 0 );
	ground.receiveShadow = true;
	scene.add( ground );

	// обект за движене
	object = new THREE.Mesh(
		new THREE.BoxBufferGeometry(8,8,8),
		new THREE.MeshLambertMaterial({color:'red'})
	);
	object.castShadow = true;
	scene.add( object );
}


function pillar( center, material )
{
	var height = center.y;
	center = new THREE.Vector3( center.x, 0, center.z );
	
	var spline = new THREE.QuadraticBezierCurve( 
		new THREE.Vector3( Math.max(1+height/1.5,10), 0, 0 ),
		new THREE.Vector3( -3, 0, 0 ),
		new THREE.Vector3( 4, height-4, 0 )
	);
	
	var points = [];
	for ( var i = 0; i <= 32; i ++ )
	{
		var p = spline.getPoint( i/32 );
		points.push( new THREE.Vector2(p.x,p.y) );
	}

	var spline = new THREE.CubicBezierCurve( 
		new THREE.Vector3( 4, height-4, 0 ),
		new THREE.Vector3( 4+6*4/(height-4), height, 0 ),
		new THREE.Vector3( 6, height+5, 0 ),
		new THREE.Vector3( 0.01, height+5, 0 )
	);
	for ( var i = 0+1; i <= 10; i ++ )
	{
		var p = spline.getPoint( i/10 );
		points.push( new THREE.Vector2(p.x,p.y) );
	}

	var pillar = new THREE.Mesh(
		new THREE.LatheBufferGeometry( points, 20 ),
		material
	);
	pillar.castShadow = true;
	pillar.receiveShadow = true;
	pillar.position.copy( center );	
	
	return pillar;
}


// елемент на робот
var robotMaterial = new THREE.MeshPhongMaterial( {color: 'tomato', shininess: 100} );
	
	
// клас за елемент на робот
function robotElement( sizeX, sizeY, sizeZ, parent )
{
	var robotGeometry = new THREE.BoxBufferGeometry( sizeX, sizeY, sizeZ );
	robotGeometry.translate( 0, sizeY/2, 0 );
	
	var object = new THREE.Mesh( robotGeometry, robotMaterial );
	object.castShadow = true;
		
	// ако има родител, регистрира елемента като негов подобект
	if( parent )
	{
		object.position.set( 0, parent.geometry.parameters.height, 0 );
		parent.add( object );
	}
	
	return object;
}
	
// клас за елемент на робот
function robotElementShape( geometry, length, parent )
{
	var object = new THREE.Mesh( geometry, robotMaterial );
	object.length = length;
	object.castShadow = true;
		
	// ако има родител, регистрира елемента като негов подобект
	if( parent )
	{
		object.position.set( 0, parent.length, 0 );
		parent.add( object );
	}
	
	return object;
}
