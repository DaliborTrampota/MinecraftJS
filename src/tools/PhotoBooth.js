import { BoxGeometry, Mesh, OrthographicCamera, WebGLRenderer, Scene } from 'three';

const iconRenderer = new WebGLRenderer({ alpha: true, antialias: true });
iconRenderer.setPixelRatio(1)
document.getElementById('photo-booth').appendChild(iconRenderer.domElement)

const PLANE = 1.2//0.9
const iconCamera = new OrthographicCamera(-PLANE, PLANE, PLANE, -PLANE, 0.001, 10)

iconCamera.position.x += 1
iconCamera.position.y += 1
iconCamera.position.z += 1
iconCamera.lookAt(0, 0, 0)

const iconGeometry = new BoxGeometry(1, 1, 1)

export default function PhotoBooth(blockItem, ICON_SIZE = 256){
    iconRenderer.setSize(ICON_SIZE, ICON_SIZE);
    
    const iconScene = new Scene()
    let iconBlock = new Mesh(blockItem.block.geometry || iconGeometry, blockItem.block.materials)

    iconScene.add(iconBlock)
    iconRenderer.render(iconScene, iconCamera)
    //if(blockItem.name == 'stairs')
    //    return animate(iconScene, iconBlock)
    iconBlock.removeFromParent()

    return iconRenderer.domElement.toDataURL('image/png', 1);
}

function animate(scene, block){
    
    block.rotation.x += 0.01
    block.rotation.z += 0.01
    iconRenderer.render(scene, iconCamera)
    requestAnimationFrame(() => animate(scene, block))
}