import { BufferGeometry, BufferAttribute, Box3, Vector3, Matrix4 } from 'https://cdn.skypack.dev/three@0.141.0';
import { sides, triangles, vertices, UVs } from './Constants.js';


export default class VoxelBuilder {

    static build(elements){
        let geometry = new BufferGeometry()
        let verts = []
        let uvs = []

        const vertData = {
            up: [],
            down: [],
            north: [],
            south: [],
            east: [],
            west: []
        }
        
        const uvData = {
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
                    if(vertData[side].at(-1)?.type == 'culled') vertData[side].at(-1).data.push(...tempVerts)
                    else vertData[side].push({ type: 'culled', data: tempVerts })

                    if(uvData[side].at(-1)?.type == 'culled') uvData[side].at(-1).data.push(...sideUVs)
                    else uvData[side].push({ type: 'culled', data: sideUVs })
                    // vertData[face.cullface].culled.push(...tempVerts)
                    // uvData[face.cullface].culled.push(...sideUVs)
                }else{
                    if(vertData[side].at(-1)?.type == 'unculled') vertData[side].at(-1).data.push(...tempVerts)
                    else vertData[side].push({ type: 'unculled', data: tempVerts})

                    if(uvData[side].at(-1)?.type == 'unculled') uvData[side].at(-1).data.push(...sideUVs)
                    else uvData[side].push({ type: 'unculled', data: sideUVs })
                    // vertData[side].unculled.push(...tempVerts)
                    // uvData[side].unculled.push(...sideUVs)
                }

                verts.push(...tempVerts)
                uvs.push(...sideUVs)
            }
        }

        geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

        return { geometry, vertices: vertData, UVs: uvData }
    }

    static rotateVertices(verts, direction) {
        
        verts = verts.map(v => v - 0.5)
        const rotationAxis = direction.clone()
        if(rotationAxis.x) {
            rotationAxis.z = -rotationAxis.x
            rotationAxis.x = 0
        } else {
            rotationAxis.x = -rotationAxis.z
            rotationAxis.z = 0
        }

        const matrix = new Matrix4()
        matrix.makeRotationAxis(new Vector3(0, 1, 0), direction.angleTo(new Vector3(-1, 0, 0)))

        for(let i = 0; i < verts.length; i += 3){
            const vert = new Vector3(verts[i], verts[i + 1], verts[i + 2])
            vert.applyMatrix4(matrix)
            verts[i] = vert.x
            verts[i + 1] = vert.y
            verts[i + 2] = vert.z
        }

        return verts.map(v => v + 0.5)
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