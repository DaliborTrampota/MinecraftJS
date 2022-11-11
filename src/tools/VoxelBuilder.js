import { BufferGeometry, BufferAttribute, Box3, Vector3 } from 'https://cdn.skypack.dev/three@0.141.0';
import { sides, triangles, vertices, UVs } from './Constants.js';


export default class VoxelBuilder {

    static build(elements){
        let geometry = new BufferGeometry()
        let verts = []
        let uvs = []

        let unculledVertData = {
            up: [],
            down: [],
            north: [],
            south: [],
            east: [],
            west: []
        }
        let unculledUvData = {
            up: [],
            down: [],
            north: [],
            south: [],
            east: [],
            west: []
        }

        let culledVertData = {
            up: [],
            down: [],
            north: [],
            south: [],
            east: [],
            west: []
        }

        let culledUvData = {
            up: [],
            down: [],
            north: [],
            south: [],
            east: [],
            west: []
        }

        for(let e of elements){
            let from = e.from.map(v => v/16)
            let to = e.to.map(v => v/16)

            for(let { side } of sides){
                let face = e.faces[side]
                if(!face) continue

                let uv = face.uv.map(v => v/16)

                let i = 0
                let sideUVs = []
                let tempVerts = []

                for(let vert of triangles[side]){
                    tempVerts.push(vertices[vert].x * (to[0] - from[0]) + from[0])
                    tempVerts.push(vertices[vert].y * (to[1] - from[1]) + from[1])
                    tempVerts.push(vertices[vert].z * (to[2] - from[2]) + from[2])

                    sideUVs.push(UVs[side][i * 2] * (uv[2] - uv[0]) + uv[0])
                    sideUVs.push(UVs[side][i*2+1] * (uv[3] - uv[1]) + uv[1])

                    i++
                }        
                
                if(side == 'up' || side == 'down'){
                    sideUVs = VoxelBuilder.rotateUVs(sideUVs)
                }

                if(face.cullface){
                    culledVertData[face.cullface].push(...tempVerts)
                    culledUvData[face.cullface].push(...sideUVs)
                }else{
                    unculledVertData[side].push(...tempVerts)
                    unculledUvData[side].push(...sideUVs)
                }

                verts.push(...tempVerts)
                uvs.push(...sideUVs)
            }
        }

        geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

        return { geometry, vertices: unculledVertData, UVs: unculledUvData, culling: {
            vertices: culledVertData,
            UVs: culledUvData
        } }
    }

    static rotateUVs(uvs){
        uvs = uvs.map(v => v - 0.5)

        for(let i = 0; i < uvs.length; i += 2){
            let temp = uvs[i]
            uvs[i] = -uvs[i + 1]
            uvs[i + 1] = temp
        }

        return uvs.map(v => v + 0.5)
    }

    static buildAABB(elements){
        let boxes = []

        for(let e of elements){
            let from = e.from.map(v => v/16)
            let to = e.to.map(v => v/16)
            let box = new Box3(new Vector3(...from), new Vector3(...to))
            boxes.push(box)
        }

        return boxes
    }

}