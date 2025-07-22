// Global variables
let scene, camera, renderer, sphere, texture;
let isMouseDown = false;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let rotationX = 0, rotationY = 0;
let fov = 75;

// Initialize the panorama viewer
function init() {
    const container = document.getElementById('panorama');
    const canvas = document.getElementById('canvas');
    const loading = document.getElementById('loading');
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Load texture (you'll need to replace this with your image path)
    const loader = new THREE.TextureLoader();
    loader.load(
        'ruang-tamu.jpg', // Path to your panorama image
        function(loadedTexture) {
            texture = loadedTexture;
            createPanorama();
            loading.classList.add('hidden');
            animate();
        },
        undefined,
        function(error) {
            console.error('Error loading texture:', error);
            loading.innerHTML = '<p>Error loading panorama image</p>';
        }
    );
    
    // Event listeners
    setupEventListeners();
}

function createPanorama() {
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    
    // Flip the geometry inside out
    geometry.scale(-1, 1, 1);
    
    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({ map: texture });
    
    // Create sphere mesh
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

function setupEventListeners() {
    const container = document.getElementById('panorama');
    
    // Mouse events
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    
    // Touch events for mobile
    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchmove', onTouchMove);
    container.addEventListener('touchend', onTouchEnd);
    
    // Wheel event for zoom
    container.addEventListener('wheel', onWheel);
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Prevent context menu
    container.addEventListener('contextmenu', (e) => e.preventDefault());
}

function onMouseDown(event) {
    event.preventDefault();
    isMouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseMove(event) {
    event.preventDefault();
    
    if (!isMouseDown) return;
    
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;
    
    // Calculate movement magnitude for each axis
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Determine primary movement direction and apply adaptive sensitivity
    let horizontalSensitivity, verticalSensitivity;
    
    if (absDeltaX > absDeltaY) {
        // Horizontal movement is dominant
        horizontalSensitivity = 0.005;  // Higher sensitivity for primary direction
        verticalSensitivity = 0.00025;   // Lower sensitivity for secondary direction
    } else {
        // Vertical movement is dominant
        horizontalSensitivity = 0.00025;  // Lower sensitivity for secondary direction
        verticalSensitivity = 0.005;   // Higher sensitivity for primary direction
    }
    
    targetRotationX -= deltaY * verticalSensitivity;
    targetRotationY += deltaX * horizontalSensitivity; // Changed from -= to +=
    
    // Limit vertical rotation
    targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, targetRotationX));
    
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseUp(event) {
    event.preventDefault();
    isMouseDown = false;
}

// Touch events
function onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        isMouseDown = true;
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
    }
}

function onTouchMove(event) {
    event.preventDefault();
    
    if (!isMouseDown || event.touches.length !== 1) return;
    
    const deltaX = event.touches[0].clientX - mouseX;
    const deltaY = event.touches[0].clientY - mouseY;
    
    // Calculate movement magnitude for each axis
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // Determine primary movement direction and apply adaptive sensitivity
    let horizontalSensitivity, verticalSensitivity;
    
    if (absDeltaX > absDeltaY) {
        // Horizontal movement is dominant
        horizontalSensitivity = 0.008;  // Higher sensitivity for primary direction
        verticalSensitivity = 0.002;   // Lower sensitivity for secondary direction
    } else {
        // Vertical movement is dominant
        horizontalSensitivity = 0.002;  // Lower sensitivity for secondary direction
        verticalSensitivity = 0.008;   // Higher sensitivity for primary direction
    }
    
    targetRotationX -= deltaY * verticalSensitivity;
    targetRotationY += deltaX * horizontalSensitivity; // Changed from -= to +=
    
    targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, targetRotationX));
    
    mouseX = event.touches[0].clientX;
    mouseY = event.touches[0].clientY;
}

function onTouchEnd(event) {
    event.preventDefault();
    isMouseDown = false;
}

function onWheel(event) {
    event.preventDefault();
    
    fov += event.deltaY * 0.05;
    fov = Math.max(30, Math.min(120, fov));
    
    camera.fov = fov;
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Smooth camera movement
    rotationX += (targetRotationX - rotationX) * 0.1;
    rotationY += (targetRotationY - rotationY) * 0.1;
    
    // Apply rotation to camera
    camera.rotation.x = rotationX;
    camera.rotation.y = rotationY;
    
    // Auto-rotate when not interacting
    if (!isMouseDown) {
        targetRotationY += 0.001; // Slow auto-rotation
    }
    
    render();
}

function render() {
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change to pause/resume
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause any heavy operations
    } else {
        // Resume
    }
});

// Utility function to convert image to data URL (for loading local images)
function loadImageAsDataURL(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Function to update panorama image
function updatePanoramaImage(imageUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, function(newTexture) {
        if (sphere && sphere.material) {
            sphere.material.map = newTexture;
            sphere.material.needsUpdate = true;
        }
    });
}