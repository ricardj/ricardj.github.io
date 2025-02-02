//Some globals for the level

var playerPosition = new THREE.Vector3(); //Used by the enemies to followw the player
var renderer;         //Used by the camera fps and the main level
var scene;
var stop = false;
var id = 1;
var mixer = null;
var action;
var reload = false;;

//Timer
var timer;

//Some sounds
var enemyDeath = new Audio();
var enemyNear = new Audio();
var gameOver = new Audio();
//var shot = new Audio();

enemyDeath.src = "assets/sounds/enemyDeath.mp3";
enemyNear.src ="assets/sounds/enemyNear.mp3";
gameOver.src = "assets/sounds/gameOver.mp3";


function inArray(vector,vectorArray)
{
    var count=vectorArray.length;
    for(var i=0;i<count;i++)
    {
        if(vectorArray[i].x===vector.x
            && vectorArray[i].y===vector.y
            && vectorArray[i].z===vector.z){return true;}
    }
    return false;
}

function random(min,max) // min and max included
                {
                    
                    var a = Math.floor(Math.random()*(max-min+1)+min);
                    if(Math.random()>0.5){
                        a*=-1
                    }
                    return a;
                }


function gameOverFunction(){
    //scene = null;
    stop = true;
    document.getElementById('title').style = "font-family: 'Iceland', cursive;color:white;font-size: 200px;grid-column: 2;grid-row: 2;text-align: center;";
    document.getElementById('title').innerHTML = "GAME OVER"
    document.getElementById('menu').style = "display:block";
    document.getElementById('new_game').innerHTML = "Reload";
    clearInterval(timer);
    gameOver.play();
}

function Weapon(){
    var oThis = this;
    this.clock = new THREE.Clock();
    this.loader = new THREE.FBXLoader();
    this.object = null;
    this.mesh;

    this.loader.load( 'assets/models/armsrifle1.fbx', function ( object ) {
         object;

        mixer = new THREE.AnimationMixer(object );

        action = mixer.clipAction( object.animations[ 0 ] );
        action.setLoop( THREE.LoopOnce );
        action.clampWhenFinished = true;
        action.enable = true;
        action.play();
        object.scale.set(0.1,0.1,0.1);

        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        //oThis.mesh.position.x = pos.x;
        //oThis.mesh.updateMatrix();
        oThis.mesh = object;
        oThis.mesh.remove = false;
        scene.add(oThis.mesh);

    } );

    this.update = function(){
        var delta = oThis.clock.getDelta();
        

        if(reload == true){
            mixer = new THREE.AnimationMixer(oThis.mesh );

            action = mixer.clipAction( oThis.mesh.animations[ 0 ] );
            action.setLoop( THREE.LoopOnce );
            action.clampWhenFinished = true;
            action.enable = true;
            action.play();        
            reload = false;
        }
        if(mixer){
            //oThis.object.position.set(pos.x, pos.y, pos.z);
            mixer.update( delta );
            //mixer.stop();
        }
    }
}

function FirstPersonCamera(){

    var oThis = this;
    this.ttj = 100;//time to jum
    this.collider;
    this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth/ window.innerHeight,
        0.1, 1000);

    this.camera.position.x = 0;
    this.camera.position.y = 10;
    this.camera.position.z = 0;
    
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.prevTime = performance.now();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.controls;

    this.controls = new THREE.PointerLockControls(this.camera);


    this.geometry = new THREE.BoxGeometry( 10, 10, 10 );
    this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00,
    transparent: true, opacity: 0} );

    this.collider = new Physijs.BoxMesh( this.geometry, this.material, 1000 );
    this.collider.position.set(this.camera.position.x, 30, this.camera.position.z);

    this.weapon = new Weapon();


    /*this.get("mesh").object.addEventListener("ready", function(){
        this.get("mesh").object.setAngularFactor(new THREE.Vector3(0, 0, 0));
    });*/



    renderer.domElement.addEventListener( 'click', function () {
        oThis.controls.lock();
    }, false );
    
    this.checkCollision = function( other_object, relative_velocity, relative_rotation, contact_normal ) {
        // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
        //console.log("The mesh is colliding");
        if(other_object.name ==  "enemy"){
            //alert("I will find you");
            //The player is dead.
            gameOverFunction();

        }
    }

    this.collider.addEventListener( 'collision', this.checkCollision );

    this.onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                oThis.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                oThis.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                oThis.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                oThis.moveRight = true;
                break;
            case 32: // space
                oThis.canJump = true;
                break;
        }
    };
    this.onKeyUp = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                oThis.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                oThis.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                oThis.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                oThis.moveRight = false;
                break;
            case 32: // space
                oThis.canJump = false;
                break;
        }
    };

    document.addEventListener( 'keydown', this.onKeyDown, false );
    document.addEventListener( 'keyup', this.onKeyUp, false );

    this.update = function (){
        var dir = new THREE.Vector3();
        var oPos = oThis.collider.position;

        oThis.camera.getWorldDirection(dir);
        dir.normalize();

        if(oThis.weapon.mesh != undefined){
            oThis.weapon.mesh.lookAt(oPos.x + dir.x*30, oPos.y + dir.y*30, oPos.z + dir.z*30);
        }

        dir.y = 0;
        dir.normalize();
        var newPosition = new THREE.Vector3(oThis.collider.position.x,oThis.collider.position.y,oThis.collider.position.z);

        if(oThis.moveForward){
                       
            newPosition.add(dir);
            oThis.collider.position.set(newPosition.x,newPosition.y,newPosition.z);

        }
        if(oThis.moveBackward){
            newPosition.sub(dir);
            oThis.collider.position.set(newPosition.x,newPosition.y,newPosition.z);

        }
        var axis = new THREE.Vector3( 0, 1, 0 );

        if(oThis.moveLeft){
            var angle = Math.PI / 2;
            dir.applyAxisAngle( axis, angle );
            newPosition.add(dir);
            oThis.collider.position.set(newPosition.x,newPosition.y,newPosition.z);
        }
        if(oThis.moveRight){
            var angle = -Math.PI / 2;
            dir.applyAxisAngle( axis, angle );
            newPosition.add(dir);
            oThis.collider.position.set(newPosition.x,newPosition.y,newPosition.z);
        }
        if(oThis.canJump && oThis.ttj < 0){
            oThis.collider.applyCentralImpulse(new THREE.Vector3(0,20000,0))
            oThis.ttj = 200;
        }


        oThis.camera.position.set(oPos.x, oPos.y + 2, oPos.z);
        
        
        oThis.collider.__dirtyPosition = true;


        var time = performance.now();
        var delta = ( time - this.prevTime ) / 1000;
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
        this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
        
        oThis.canJump = false;
        this.prevTime = time;
        oThis.ttj -= 1;

        playerPosition = this.camera.position;
        
        if(oThis.weapon.mesh != undefined){
            oThis.weapon.update();
            oThis.weapon.mesh.position.set(oPos.x + dir.x * 2, oPos.y-0.5 + dir.y*2, oPos.z + dir.z *2);
        }

        if(oPos.y <=  -60){
            gameOverFunction();
        }
    }

}

function Enemy(id) {
    var oThis = this;
    this.speed = 0.5;
    
    loader = new THREE.OBJLoader();
    this.mesh = new THREE.Mesh();

    loader.load('assets/models/enemy1.obj', function(object){

        //console.log(object);
        object = object.children[0];
        var tamanio = 3;
        var geometry = object.geometry;

        var texture = new THREE.TextureLoader().load( "assets/images/zombie_1.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 2, 2 );
        var material =new THREE.MeshPhysicalMaterial({
            map: texture,
            color: 0xF44541,
            normalMap:texture
        });

        oThis.mesh = new Physijs.BoxMesh(geometry, material, 3000);
        oThis.mesh.name = "enemy";
        oThis.mesh.lives = 2;
        oThis.mesh.id = id;
        oThis.mesh.position.set(random(20,500),10,random(20,500));
        oThis.mesh.remove = true;
        scene.add(oThis.mesh);
        oThis.mesh.addEventListener( 'collision', oThis.handleCollision );
    });

    this.handleCollision = function( other_object, relative_velocity, relative_rotation, contact_normal ) {
        // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
        //console.log("The mesh is colliding");
        if(other_object.name ==  "bullet"){
            //console.log("Dammit! the enemy killed me");
            oThis.mesh.lives -=1;
            if(oThis.mesh.lives <= 0){
                scene.remove(oThis.mesh);
                scene.remove(other_object);
                enemyDeath.play();
            }
        }
    }

    
    this.update = function(){
        
        this.mesh.rotateY(0.2 * Math.PI/180);
        this.mesh.__dirtyRotation = true;
        
        var matrix = new THREE.Matrix4();
        matrix.extractRotation( this.mesh.matrix );
        var direction = new THREE.Vector3( 1, 0, 0 );
        direction.applyMatrix4( matrix );

        
        var newPosition = new THREE.Vector3(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z);
        var playerPositionCopy = new THREE.Vector3();
        playerPositionCopy.copy(playerPosition);
        direction = playerPositionCopy.sub(newPosition);
        direction.normalize();
        direction.y = 0;
        direction.multiplyScalar(oThis.speed);
        newPosition.add(direction);
        this.mesh.position.set(newPosition.x,newPosition.y,newPosition.z);
        this.mesh.__dirtyPosition = true;

    }
    character = this;

}


function Environment(){
    this.geometry = new THREE.SphereGeometry(90, 32, 32);
    this.material = new THREE.MeshBasicMaterial();
    this.material.map = THREE.ImageUtils.loadTexture('assets/images/skybox_1.jpg');
  
    // this.material.side = THREE.BackSide;
    // this.material.depthTest = false;
    // this.material.depthWrite = false;
  
    this.mesh = new THREE.Mesh(this.geometry,this.material);

    this.update = function(){
        
    }
}


function BulletManager(level){
    var oThis = this;
    this.pressed = false;
    this.shooting = false;
    this.canShoot = 15;

    this.bullets = [];
    this.mainLevel = level;
    this.burstShoot = 1;

    this.addBullet = function (){
        /*let bullet = new THREE.Mesh(
            new THREE.SphereGeometry(20,20,20),
            new THREE.MeshBasicMaterial({color:0xffffff})
            
        );*/
       
        /** ***************************************************/

        var ballMaterial = new THREE.MeshToonMaterial( { color: 0x876125 } );

        var ballMass = 35;
        var ballRadius = 0.4; 
        var bullet = new Physijs.SphereMesh( 
            new THREE.SphereGeometry( ballRadius, 10, 10 ), 
            ballMaterial,
            ballMass
        );
        bullet.name= "bullet";
        /*bullet.addEventListener('collision', function(object){
            console.log("hello world"); // NOT FIRING
        });*/

        let c = oThis.mainLevel.camera;
        console.log(c.position.y);
        let dir = new THREE.Vector3(); ;
        c.getWorldDirection(dir);

        bullet.position.set(

            c.position.x + dir.x *4,
            c.position.y + dir.y *4,
            c.position.z + dir.z *4
        );

        
        bullet.castShadow = true;
        bullet.receiveShadow = true;


        this.bullets.push(bullet);              
        bullet.remove = true;  
        scene.add(bullet);
        var speed = 100;
        bullet.setLinearVelocity( new THREE.Vector3( dir.x * speed, dir.y * speed , dir.z *speed ) ); 

    }

    this.shoot = function(){

        if(oThis.shooting == false){
            
            oThis.burstShoot = 1;
            oThis.shooting = true;
        }
    }
    this.cancelShoot = function(){
        oThis.shooting = false;
        oThis.canShoot = 15;
        //oThis.burstShoot = 1;
        reload = true;

    }

    document.addEventListener( 'mousedown', this.shoot, false );
    document.addEventListener( 'mouseup', this.cancelShoot, false );


    this.update = function(){
        if(oThis.shooting && oThis.burstShoot <= 3 && oThis.canShoot <= 0){
            this.addBullet();
            let shot = new Audio();
            shot.src = "assets/sounds/shot.mp3";
            shot.play();
            oThis.burstShoot += 1;
            oThis.canShoot = 15;
            
         //   shooting = false;
        }
        oThis.canShoot -= 1;
    }
}

function MainLevel(foreignRenderer){
    var oThis = this;
    renderer = foreignRenderer;
    this.renderer = foreignRenderer;
    this.bullets = [];    

    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3( 0, -20, 0 ))
    //scene.fog = new THREE.Fog( 0x000000, 0, 250 );
    scene.updateMatrixWorld(true);
    
    this.updatable_assets = [];

    oThis.scale = 1;
    oThis.mouseX = 0;
    oThis.mouseY = 0;
    
    createLight();
    createEnvironment();
    createCamera();
    createPlatform();
    createFloor();
    createBulletManager();
    createColliderBorders();
    this.startLevel = function() {

        createEnemies();

        var startTime = new Date().getTime();
        timer = setInterval(function() {

            var t = new Date().getTime() - startTime;
        

            if (t >= 0) {

                let days = Math.floor(t / (1000 * 60 * 60 * 24));
                let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
                let secs = Math.floor((t % (1000 * 60)) / 1000);
                
                document.getElementById("timer-days").innerHTML = days + "<span class='label'>:</span>";

                document.getElementById("timer-hours").innerHTML= ("0" + hours).slice(-2) +"<span class='label'>:</span>";

                document.getElementById("timer-mins").innerHTML= ("0" + mins).slice(-2) + "<span class='label'>:</span>";

                document.getElementById("timer-secs").innerHTML= ("0" + secs).slice(-2) + "<span class='label'></span>";
            
            }


        }, 1000);

        var enemyGenerator = setInterval(function(){
            createEnemies();
        },15000);
        stop = false;
    }

    this.render = function() {
        
        if(!stop){
            var e;
            for (e in this.updatable_assets){
                if(this.updatable_assets[e] != undefined){
                    this.updatable_assets[e].update();
                }
            }
            scene.updateMatrixWorld(true);
            scene.simulate();
            this.renderer.render(scene,this.camera);
        }else{
            var e;
            for(e in this.updatable_assets){
                this.updatable_assets[e] = undefined;
            }
            for (let i = scene.children.length - 1; i >= 0; i--) {
                if(scene.children[i].remove == true)
                    scene.remove(scene.children[i]);
            }
            this.renderer.renderLists.dispose();
            //stop = false;
        }
    }

    function createBulletManager(){
        var bulletManager = new BulletManager(oThis);
        this.bulletManager = bulletManager;
        oThis.updatable_assets.push(bulletManager);

    }

    function createCamera (){

        //fps camera
        var fps_camera =new FirstPersonCamera(); 
        oThis.camera = fps_camera.camera;
        oThis.camera.add(oThis.environment.mesh);
        fps_camera.collider.remove = false;
        scene.add(fps_camera.collider);
        //oThis.fps = fps.camera;
        oThis.updatable_assets.push(fps_camera);
    }

    function createColliderBorders(){
        //No pass border limits

        var geometry0 = new THREE.CubeGeometry( 4000, 1, 4000);
        var geometry1 = new THREE.CubeGeometry( 4000, 2000, 1);
        var geometry2 = new THREE.CubeGeometry( 2000, 4000, 1);
        var geometry3 = new THREE.CubeGeometry( 1, 4000, 2000);
        var geometry4 = new THREE.CubeGeometry( 1, 4000, 2000);
       
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00,
            transparent: true, opacity: 0} );

        var element0 = new Physijs.BoxMesh(geometry0,material,0);
        var element1 = new Physijs.BoxMesh(geometry1,material,0);
        var element2 = new Physijs.BoxMesh(geometry2,material,0);
        var element3 = new Physijs.BoxMesh(geometry3,material,0);
        var element4 = new Physijs.BoxMesh(geometry4,material,0);

        element0.position.set(0,-100,0);
        element1.position.set(0,0,-1000);
        element2.position.set(0,0,1000);
        element3.position.set(-1000,0,0);
        element4.position.set(1000,0,0);

        element0.addEventListener( 'collision', this.checkCollision );
        element1.addEventListener( 'collision', this.checkCollision );
        element2.addEventListener( 'collision', this.checkCollision );
        element3.addEventListener( 'collision', this.checkCollision );
        element4.addEventListener( 'collision', this.checkCollision );

        scene.add(element0);
        scene.add(element1);
        scene.add(element2);
        scene.add(element3);
        scene.add(element4);

        this.checkCollision = function( other_object, relative_velocity, relative_rotation, contact_normal ) {
            // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
            //console.log("The mesh is colliding");
            if(other_object.name ==  "bullet"){
                scene.remove(other_object)
            }
        }
    }
      
    function createPlatform(){
        var texture = new THREE.TextureLoader().load( "assets/images/baldosa_1.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 5, 5 );

        var geometry = new THREE.PlaneGeometry(1000,1000);
        var material = new THREE.MeshStandardMaterial({
          map: texture,
          color: 0x4286f4,
          bumpMap: texture
        });
      
        material.side = THREE.DoubleSide;
      
        var platform = new Physijs.BoxMesh(
          geometry,
          material
        );
      
        platform.rotation.x = Math.PI / 2;
        platform.remove = false;

        this.checkCollision = function( other_object, relative_velocity, relative_rotation, contact_normal ) {
            // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
            //console.log("The mesh is colliding");
            if(other_object.name ==  "bullet"){
                //alert("I will find you");
                //The player is dead.
                scene.remove(other_object);
    
            }
        }

        platform.addEventListener( 'collision', this.checkCollision );

        
        scene.add(platform);
    }
      
      
    function createLight(){
        var lightColor = 0xffffff;
        var lights = [];

        for(var i = 0;i < 4; i++){
            var light = new THREE.DirectionalLight(lightColor,1);
            light.name = 'directional';
            lights.push(light);
        }

        var lightAltitude = 10;
        lights[0].position.set(100,lightAltitude,100);
        lights[0].position.set(-100,lightAltitude,-100);
        lights[0].position.set(-100,lightAltitude,100);
        lights[0].position.set(100,lightAltitude,-100);


        for(var i = 0; i < 4; i++){
            lights[i].remove = false;

            scene.add(lights[i]);
        }
      
        var ambientLight = new THREE.AmbientLight(0x000000);

        ambientLight.remove = false;
        scene.add(ambientLight);
    }
      
    function createEnvironment(){
        oThis.environment = new Environment();
      
        oThis.updatable_assets.push(oThis.environment);
        
    }
    
    
    function createEnemies(){
        for (var i = 0; i < 20; i ++){
            
            var enemy = new Enemy(id);
            oThis.updatable_assets.push(enemy);
            id += 1;
        }
    }

    function createFloor(){
        //We readd the mesh
        loader = new THREE.OBJLoader();

        var mapLoaded = false;
        var map = undefined;

        loader.load("assets/models/map2.obj", function(object){
            map = object.children[0];
            loader.load('assets/models/torre1.obj', function(object){

                //console.log(object);
                object = object.children[0];
                var tamanio = 3;
                var geometry = object.geometry;
                var loader = new THREE.TextureLoader();
                var colorTexture = loader.load( "assets/images/DefaultMaterial_Base_Color.png" );
    
                var normalTexture = loader.load("assets/images/DefaultMaterial_Normal.png")
                var bumpTexture = loader.load("assets/images/DefaultMaterial_Height.png")
    
                var material = new THREE.MeshPhongMaterial({
                    color: 0x4286f4,
                    map:colorTexture,
                    normalMap:normalTexture,
                    bumpMap:bumpTexture,
                });
                var towerList = [];
                

                var positions =  map.geometry.attributes["position"].array;
                let ptCout = positions.length / 3;
                var towers = 100;
                // for (let i = 0; i < ptCout && i < towers; i++)
                // {
                //     let v = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                //     var element = new Physijs.BoxMesh(geometry,material,0);
                //     element.position.set(v.x,30,v.z);
                //     element.rotation.set(0,random(0,360),0)
                //     scene.add(element);
                
                // }

                var position = map.geometry.attributes.position;
                var vector = new THREE.Vector3();
                var addedVectors = [];

                for ( let i = 0, l = position.count; i < l; i ++ ){
                    
                    vector = new THREE.Vector3();
                    vector.fromBufferAttribute( position, i );
                    vector.applyMatrix4( map.matrixWorld );

                    v = vector;
                    if (!inArray(v,addedVectors)){
                        var element = new Physijs.BoxMesh(geometry,material,0);
                        element.position.set(v.x,30,v.z);
                        element.rotation.set(0,random(0,360),0);
                        element.remove = false;


                        this.checkCollision = function( other_object, relative_velocity, relative_rotation, contact_normal ) {
                            // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
                            //console.log("The mesh is colliding");
                            if(other_object.name ==  "bullet"){
                                //alert("I will find you");
                                //The player is dead.
                                scene.remove(other_object);
                    
                            }
                        }
                
                        element.addEventListener( 'collision', this.checkCollision );
                        

                        scene.add(element);
                        addedVectors.push(v);
                    }
                    
                
                }

                
            });

        });

    }
}