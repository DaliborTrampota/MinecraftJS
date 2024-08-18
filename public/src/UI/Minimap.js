import { Vector3 } from 'three'
import Chunk from '../level/Chunk.js'


export default class Minimap {

    constructor(player, canvas) {
        /**
         * @type {import('../player/Player.js').default}
         */
        this.player = player

        this.canvas = canvas
        this.ctx = canvas.getContext('2d')

        this.width = canvas.width
        this.height = canvas.height

        this.zoom = 1

        // window.game.addUpdateSub(this)
        console.log('created minimap')
        setInterval(this.Update.bind(this), 2000)
    }


    Update(delta) {
        this.draw()
    }

    draw() {
        const pixels = []

        const step = this.zoom

        const center = this.player.position.clone().floor()
        center.x -= Math.floor(this.width / step / 2)
        center.z -= Math.floor(this.height / step / 2)
        
        const world = this.player.world
        for(let i = 0; i < this.width; i += step) {
            for(let j = 0; j < this.height; j += step) {
                const pixelPos = new Vector3(center.x + i, center.y, center.z + j)
                const inChunkPos = Chunk.modCoords(pixelPos)
                const chunk = world.getChunkFromPos(pixelPos)
                let rgba
                if(chunk) {
                    // console.log(chunk.id)
                    pixelPos.y = chunk.heightAt(inChunkPos.x, inChunkPos.z)
                    const block = world.getVoxelFromPos(pixelPos)
                    switch(block.key) {
                        case 'water_flow': case 'water_still':
                            rgba = [0, 0, 255, 255]
                            break
                        case 'air':
                            rgba = [173, 216, 230, 255]
                            break;

                        default: 
                            rgba = [64, 200, 0, 255]
                    }
                } else {
                    rgba = [173, 216, 230, 255]
                }
                for(let i = 0; i < step; ++i) {
                    console.log(i)
                    pixels.push(...rgba)
                }
            }
        }
        console.log(this.width, this.height, pixels.length)
        const imgData = new ImageData(new Uint8ClampedArray(pixels), this.width, this.height)
        this.ctx.putImageData(imgData, 0, 0)
    }

}