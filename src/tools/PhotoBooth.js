import { Mesh, OrthographicCamera, WebGLRenderer, Scene } from 'three';
import TextureManager from './TextureManager';

const iconRenderer = new WebGLRenderer({ alpha: true, antialias: true });
iconRenderer.setPixelRatio(1)
document.getElementById('photo-booth').appendChild(iconRenderer.domElement)

const PLANE = 1.2//0.9
const iconCamera = new OrthographicCamera(-PLANE, PLANE, PLANE, -PLANE, 0.001, 10)

iconCamera.position.x += 1
iconCamera.position.y += 1
iconCamera.position.z += 1
iconCamera.lookAt(0, 0, 0)

export default function PhotoBooth(blockItem, ICON_SIZE = 256){
    iconRenderer.setSize(ICON_SIZE, ICON_SIZE);
    
    const iconScene = new Scene()
    let iconBlock = new Mesh(blockItem.block.geometry, TextureManager.textures)

    iconScene.add(iconBlock)
    iconRenderer.render(iconScene, iconCamera)
    //if(blockItem.name == 'stairs')
    //    return animate(iconScene, iconBlock)
    iconBlock.removeFromParent()
    //blockItem.block.geometry.dispose()
    //delete blockItem.block.geometry

    return iconRenderer.domElement.toDataURL('image/png', 1);
}

function animate(scene, block){
    
    block.rotation.x += 0.01
    block.rotation.z += 0.01
    iconRenderer.render(scene, iconCamera)
    requestAnimationFrame(() => animate(scene, block))
}