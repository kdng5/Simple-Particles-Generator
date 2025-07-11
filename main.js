import * as THREE from 'three';
import {GUI} from 'dat.gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//#region Scene, Renderer, and Camera setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = false;
let cameraControl = false;
//#endregion

//#region Shapes setup
const texture = new THREE.TextureLoader().load('public/Texture.jpg');

const planeGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({map: texture});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.material.wireframe = true;
plane.position.y = -1;
plane.rotation.x = -Math.PI / 2;

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial( {map: texture} );
const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );

const sphereGeometry = new THREE.SphereGeometry(1, 1, 1);
const sphereMaterial = new THREE.MeshBasicMaterial({map: texture});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

const tetraGeometry = new THREE.TetrahedronGeometry(1, 1);
const tetraMaterial = new THREE.MeshBasicMaterial({map: texture});
const tetra = new THREE.Mesh(tetraGeometry, tetraMaterial);

const octaGeometry = new THREE.OctahedronGeometry(1, 1);
const octaMaterial = new THREE.MeshBasicMaterial({map: texture});
const octa = new THREE.Mesh(octaGeometry, octaMaterial);

const coneGeometry = new THREE.ConeGeometry(1, 2, 3);
const coneMaterial = new THREE.MeshBasicMaterial({map: texture});
const cone = new THREE.Mesh(coneGeometry, coneMaterial);

const shapes = [cube, sphere, tetra, octa, cone];
let index = 0;
//#endregion

//#region Functions
function animate()
{
    handleToss();
    handleAnimation();
    renderer.render(scene, camera);
}

function changeShape()
{
    scene.remove(shapes[index]);
    index = (index + 1) % 5;
    scene.add(shapes[index]);
}

let shapeScaleX = 1; let shapeScaleY = 1; let shapeScaleZ = 1;
let prevScaleX = 1; let prevScaleY = 1; let prevScaleZ = 1;
function scaleShapes()
{
    shapes.forEach(shape => shape.geometry.scale((1 / prevScaleX) * shapeScaleX, (1 / prevScaleY) * shapeScaleY, (1 / prevScaleZ) * shapeScaleZ));
    prevScaleX = shapeScaleX; prevScaleY = shapeScaleY; prevScaleZ = shapeScaleZ;
}

function toggleWireframe()
{
    shapes.forEach(shape => {shape.material.wireframe = !shape.material.wireframe;});
}

let tossShapes = []
let spawnRangeX = 5; let spawnRangeY = 1; let spawnRangeZ = 5;
let spawnX; let spawnY; let spawnZ;
let scaleX = 0.5; let scaleY = 0.5; let scaleZ = 0.5;
function tossShape()
{
    let shape = shapes[index].clone();
    generateRandomSpawnPos();
    shape.position.set(spawnX, spawnY, spawnZ);
    shape.scale.set(scaleX, scaleY, scaleZ);
    scene.add(shape);
    tossShapes.push(shape);
}

function generateRandomSpawnPos()
{
    spawnX = THREE.MathUtils.randFloat(-spawnRangeX, spawnRangeX);
    spawnY = THREE.MathUtils.randFloat(-spawnRangeY, spawnRangeY);
    spawnZ = THREE.MathUtils.randFloat(-spawnRangeZ, spawnRangeZ);
}

let velocity = 0.1;
let sky = 2;
function handleToss()
{
    tossShapes.forEach(shape =>
    {
        if(shape.position.y <= sky) shape.position.y += velocity;
    });
}

let animateShape = false;
function handleAnimation()
{
    if(!animateShape) return;
    rotateShape(shapes[index]);
    tossShapes.forEach(shape => rotateShape(shape));
}

let axisX = false; let axisY = false; let axisZ = false;
let reverse = 1; let rotateSpeed = 0.01;
function rotateShape(shape)
{
    if(axisX) shape.rotateX(rotateSpeed * reverse);
    if(axisY) shape.rotateY(rotateSpeed * reverse);
    if(axisZ) shape.rotateZ(rotateSpeed * reverse);
}
//#endregion

//#region Event listeners functions
window.addEventListener('resize', () =>
{
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

document.addEventListener('keydown', (event) =>
{
    if(event.repeat) return;
    switch(event.key)
    {
        case 'z': tossShape(); break;
        case 'x': toggleWireframe(); break;
        case 'c': changeShape(); break;
        default: break;
    }
});

let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;
document.addEventListener('mousedown', (event) =>
{
    isMouseDown = true;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
});

document.addEventListener('mousemove', (event) =>
{
    if(!isMouseDown || cameraControl) return;
    shapes[index].rotation.y += (event.clientX - prevMouseX) * 0.01;
    shapes[index].rotation.x += (event.clientY - prevMouseY) * 0.01;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
});

window.addEventListener('mouseup', () =>
{
    isMouseDown = false;
});
//#endregion

//#region GUI
//#region Toss GUI
const tossGUI = new GUI();
tossGUI.domElement.style.position = 'absolute';
tossGUI.domElement.style.top = '250px';
tossGUI.domElement.style.left = '70px';
tossGUI.domElement.style.transform = 'scale(1.5)';

const tossParams =
    {
        spawnRangeX: spawnRangeX, spawnRangeY: spawnRangeY, spawnRangeZ: spawnRangeZ,
        scaleX: scaleX, scaleY: scaleY, scaleZ: scaleZ,
        velocity: velocity, sky: sky
    };

let spawnFolder = tossGUI.addFolder('Spawn Range');
const rX = spawnFolder.add(tossParams, 'spawnRangeX', 0, 100, 0.1).name('Range X').onChange((value) => spawnRangeX = value);
const rY = spawnFolder.add(tossParams, 'spawnRangeY', 0, 100, 0.1).name('Range Y').onChange((value) => spawnRangeY = value);
const rZ = spawnFolder.add(tossParams, 'spawnRangeZ', 0, 100, 0.1).name('Range Z').onChange((value) => spawnRangeZ = value);

let scaleFolder = tossGUI.addFolder('Spawned Shape Size');
const sX = scaleFolder.add(tossParams, 'scaleX', 0, 2, 0.1).name('Size X').onChange((value) => scaleX = value);
const sY = scaleFolder.add(tossParams, 'scaleY', 0, 2, 0.1).name('Size Y').onChange((value) => scaleY = value);
const sZ = scaleFolder.add(tossParams, 'scaleZ', 0, 2, 0.1).name('Size Z').onChange((value) => scaleZ = value);

const velSlider = tossGUI.add(tossParams, 'velocity', 0.001, 0.1, 0.001).name('Velocity').onChange((value) => velocity = value);
const skySlider = tossGUI.add(tossParams, 'sky', 0, 31264, 0.1).name('Ceiling Height').onChange((value) => sky = value);

tossGUI.add({resetToss: () =>
    {
        rX.setValue(5); rY.setValue(1); rZ.setValue(5);
        sX.setValue(0.5); sY.setValue(0.5); sZ.setValue(0.5);
        velSlider.setValue(0.1); skySlider.setValue(2);
    }}, 'resetToss').name('Reset');
//#endregion

//#region Shape GUI
const shapeGUI = new GUI();
const sizeFolder = shapeGUI.addFolder('Shape Size');
const animateFolder = shapeGUI.addFolder('Animation');
shapeGUI.domElement.style.position = 'absolute';
shapeGUI.domElement.style.top = '250px';
shapeGUI.domElement.style.right = '50px';
shapeGUI.domElement.style.transform = 'scale(1.5)';

const shapeParams =
    {
        scaleX: shapeScaleX, scaleY: shapeScaleY, scaleZ: shapeScaleZ,
    };

const ssX = sizeFolder.add(shapeParams, 'scaleX', 1, 3, 0.01).name('Shape Size X').onChange((value) => {shapeScaleX = value; scaleShapes()});
const ssY = sizeFolder.add(shapeParams, 'scaleY', 1, 3, 0.01).name('Shape Size Y').onChange((value) => {shapeScaleY = value; scaleShapes()});
const ssZ = sizeFolder.add(shapeParams, 'scaleZ', 1, 3, 0.01).name('Shape Size Z').onChange((value) => {shapeScaleZ = value; scaleShapes()});

const animateParams =
    {
        axisX: axisX, axisY: axisY, axisZ: axisZ,
        reverse: reverse, rotateSpeed: rotateSpeed
    };

const rotateX = animateFolder.add(animateParams, 'axisX').name('Rotate X').onChange((value) => axisX = value);
const rotateY = animateFolder.add(animateParams, 'axisY').name('Rotate Y').onChange((value) => axisY = value);
const rotateZ = animateFolder.add(animateParams, 'axisZ').name('Rotate Z').onChange((value) => axisZ = value);
const rotateSpeedSlider = animateFolder.add(animateParams, 'rotateSpeed', 0.001, 0.1, 0.001).name('Rotate Speed').onChange((value) => rotateSpeed = value);
animateFolder.add({reverse: () => reverse *= -1}, 'reverse').name('Reverse');

shapeGUI.add({resetShape: () =>
    {
        ssX.setValue(1); ssY.setValue(1); ssZ.setValue(1);
        rotateX.setValue(false); rotateY.setValue(false); rotateZ.setValue(false);
        reverse = 1; rotateSpeedSlider.setValue(0.01);
    }}, 'resetShape').name('Reset');
//#endregion

//#region Buttons
document.getElementById('cameraButton').addEventListener('click', () => {
    cameraControl = !cameraControl;
    orbitControls.enabled = cameraControl;
});

document.getElementById('resetSkyButton').addEventListener('click', () => {
    tossShapes.forEach(shape => scene.remove(shape));
    tossShapes = [];
});

document.getElementById('animateButton').addEventListener('click', () => animateShape = !animateShape);
//#endregion

//#region Main
toggleWireframe();
scene.add(cube);
scene.add(plane);
renderer.setAnimationLoop(animate);
//#endregion