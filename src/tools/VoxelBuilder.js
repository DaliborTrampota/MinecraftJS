import { BufferGeometry, BufferAttribute, Vector3, Matrix4, Matrix3, Vector2 } from 'three';
import { sides, triangles, vertices, UVs } from './Constants.js';


export default class VoxelBuilder {

    static build(elements, textures){
        let geometry = new BufferGeometry()
        let verts = []
        let uvs = []
        let groupStart = 0


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
                    if(vertData[side].at(-1)?.cullface == face.cullface) vertData[side].at(-1).data.push(...tempVerts)
                    else vertData[side].push({ cullface: face.cullface, data: tempVerts })

                    if(uvData[side].at(-1)?.cullface == face.cullface) uvData[side].at(-1).data.push(...sideUVs)
                    else uvData[side].push({ cullface: face.cullface, data: sideUVs })
                    // vertData[face.cullface].culled.push(...tempVerts)
                    // uvData[face.cullface].culled.push(...sideUVs)
                }else{
                    if(vertData[side].at(-1)?.cullface === false) vertData[side].at(-1).data.push(...tempVerts)
                    else vertData[side].push({ cullface: false, data: tempVerts})

                    if(uvData[side].at(-1)?.cullface === false) uvData[side].at(-1).data.push(...sideUVs)
                    else uvData[side].push({ cullface: false, data: sideUVs })
                    // vertData[side].unculled.push(...tempVerts)
                    // uvData[side].unculled.push(...sideUVs)
                }

                verts.push(...tempVerts)
                uvs.push(...sideUVs)
                
                geometry.addGroup(groupStart, i, Number(Object.values(textures).findIndex(idx => idx == textures[side]))) // we need to get texture index only from the textures (block.materials) this block is using, not all loaded textures like chunk mesh
                groupStart += i
            }
        }

        geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

        return { geometry, vertices: vertData, UVs: uvData }
    }

    static rotateVertices(verts, angle, rotationAxis = new Vector3(0, 1, 0), center = 0.5) {
        if(angle == 0) return verts
        if(center) verts = verts.map(v => v - center)

        // const rotationAxis = direction.clone()
        // if(rotationAxis.x) {
        //     rotationAxis.z = -rotationAxis.x
        //     rotationAxis.x = 0
        // } else {
        //     rotationAxis.x = -rotationAxis.z
        //     rotationAxis.z = 0
        // }

        const matrix = new Matrix4()
        matrix.makeRotationAxis(rotationAxis, angle)

        for(let i = 0; i < verts.length; i += 3){
            const vert = new Vector3(verts[i], verts[i + 1], verts[i + 2])
            vert.applyMatrix4(matrix)
            verts[i    ] = vert.x
            verts[i + 1] = vert.y
            verts[i + 2] = vert.z
        }

        return center ? verts.map(v => v + center) : verts
    }

    static rotateUVs(uvs, angle = 0){
        uvs = uvs.map(v => v - 0.5)
        
        const matrix = new Matrix3()
        matrix.makeRotation(angle)

        for(let i = 0; i < uvs.length; i += 2){
            const uv = new Vector2(uvs[i], uvs[i + 1])
            uv.applyMatrix3(matrix)
            uvs[i] = uv.x
            uvs[i + 1] = uv.y
        }

        return uvs.map(v => v + 0.5)
    }

    static rotateSide(side, angle, axis) {
        let { dir } = sides.find(s => s.side == side)
        let newDir = dir.clone().applyAxisAngle(axis, angle).round()
        return sides.find(s => s.dir.equals(newDir)).side

    }

    static buildFace(pos, side, blockState, blockData, culling = false) {
        let { verts, uvs } = blockData.getFace(side, culling)
        if(blockData.animation) uvs = uvs.map((u, i) => i % 2 ? u / blockData.animation.frames : u)      

        if(blockState && (side == 'up' || side == 'down')) {
            uvs = VoxelBuilder.rotateUVs(uvs, blockState.rotation)
        }

        if(blockState && blockData.voxel) {
            verts = VoxelBuilder.rotateVertices(verts, blockState.angle, blockState.rotationAxis)
        }

        for (let i = 0; i < verts.length; i += 3) {
            verts[i    ] += pos.x
            verts[i + 1] += pos.y
            verts[i + 2] += pos.z
        }

        return { 
            verts,
            uvs
        }
    }
}