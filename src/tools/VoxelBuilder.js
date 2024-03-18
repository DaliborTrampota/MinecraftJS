import { BufferGeometry, BufferAttribute, Vector3, Matrix4, Matrix3, Vector2 } from 'three';
import { triangles, vertices, UVs } from './Constants.js';
import Side from '../structures/Side.js';
import TextureManager from './TextureManager.js';


export default class VoxelBuilder {

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

    static buildFace(side, blockState, blockData, culling = false) {
        let { verts, uvs, material } = blockData.getFace(side, culling)
        
        if(blockState) {
            verts = this.rotateVertices(verts, blockState.angle, blockState.rotationAxis)

            if(blockState.rotation) {
                verts = this.rotateVertices(verts, blockState.rotation, new Vector3().crossVectors(Vector3.Up, facing))
            }
        }
        // if(blockData.animation) uvs = uvs.map((u, i) => i % 2 ? u / blockData.animation.frames : u)      

        // if(blockState && blockState.rotation && (side == 'up' || side == 'down')) {
        //     uvs = VoxelBuilder.rotateUVs(uvs, blockState.rotation)
        // }

        // if(blockState && blockData.voxel) {
        //     verts = VoxelBuilder.rotateVertices(verts, blockState.angle, blockState.rotationAxis)
        // }
        return { 
            verts,
            uvs,
            material
        }
    }

    static ROTATION_MAP = {
        [Side.North]: new Matrix4(),
        [Side.South]: new Matrix4().makeRotationAxis(Vector3.UpC, Math.PI),
        [Side.West]: new Matrix4().makeRotationAxis(Vector3.UpC, -Math.PI / 2),
        [Side.East]: new Matrix4().makeRotationAxis(Vector3.UpC, Math.PI / 2),
        [Side.Up]: new Matrix4().makeRotationAxis(Vector3.NorthC, -Math.PI / 2),
        [Side.Down]: new Matrix4().makeRotationAxis(Vector3.NorthC, Math.PI / 2),
    }

    static rotateFaceTo(side, verts) {
        verts = verts.map(v => v - 0.5)
        const matrix = side instanceof Matrix4 ? side : VoxelBuilder.ROTATION_MAP[side]
        console.log(matrix)

        for(let i = 0; i < verts.length; i += 3){
            const vert = new Vector3(verts[i], verts[i + 1], verts[i + 2])
            vert.applyMatrix4(matrix)
            verts[i    ] = vert.x + 0.5
            verts[i + 1] = vert.y + 0.5
            verts[i + 2] = vert.z + 0.5
        }

        return verts
    }

    static rotateToTopHalf(verts, perpendicualrAxis, angle = Math.PI / 2) {
        const matrix = new Matrix4().makeRotationAxis(perpendicualrAxis, angle)
        return this.rotateFaceTo(matrix, verts)
    }

    static build(elements, animationData) {
        const geometry = new BufferGeometry()
        let verts = []
        let uvs = []
        let groupStart = 0
        
        const culled = {
            verts: {},
            uvs: {},
            rawUVs: {},
        }

        const unculled = {
            verts: {},
            uvs: {},
            rawUVs: {},
        }
        
        const materials = new Set()
        
        for(let e of elements){
            let from = e.from.map(v => v/16)
            let to = e.to.map(v => v/16)
            
            for(let sideName in e.faces) {
                const face = e.faces[sideName]
                const side = Side.NameToSide(sideName)

                let uv = face.uv ? face.uv.map(v => v/16) : VoxelBuilder.autoUVs(from, to, side)//[0, 0, 1, 1]
                console.log(uv, face, sideName, from, to)

                let i = 0
                let tempVerts = [], tempUVs = [], tempRawUVs = []
                const textureUVs = TextureManager.textureMap.get(face.texture)
                const matID = TextureManager.atlasMap.get(face.texture)
                
                for(let vert of triangles[side]){
                    tempVerts.push(vertices[vert].x * (to[0] - from[0]) + from[0])
                    tempVerts.push(vertices[vert].y * (to[1] - from[1]) + from[1])
                    tempVerts.push(vertices[vert].z * (to[2] - from[2]) + from[2])

                    const u = UVs[side][i * 2] * (uv[2] - uv[0]) + uv[0]
                    const v = UVs[side][i*2+1] * (uv[3] - uv[1]) + uv[1]

                    tempRawUVs.push(u, v)
                    tempUVs.push(this.translateUV(u, textureUVs[0], textureUVs[2]))
                    tempUVs.push(this.translateUV(v, textureUVs[1], textureUVs[3], animationData))
                    
                    i++
                }        

                verts.push(...tempVerts)
                uvs.push(...tempUVs)

                if (face.cullface) {
                    culled.verts[side] ??= []
                    culled.uvs[side] ??= []
                    culled.rawUVs[side] ??= []


                    culled.verts[side].push(...tempVerts)
                    culled.uvs[side].push(...tempUVs)
                    culled.rawUVs[side].push(...tempRawUVs)
                } else {
                    unculled.verts[side] ??= []
                    unculled.uvs[side] ??= []
                    unculled.rawUVs[side] ??= []

                    unculled.verts[side].push(...tempVerts)
                    unculled.uvs[side].push(...tempUVs)
                    unculled.rawUVs[side].push(...tempRawUVs)
                }
                
                materials.add(matID)

                geometry.addGroup(groupStart, i, matID) // we need to get texture index only from the textures (block.materials) this block is using, not all loaded textures like chunk mesh
                groupStart += i
            }
        }

        geometry.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
        geometry.setAttribute('ao', new BufferAttribute(new Float32Array(verts.length / 3).fill(1), 1))
        geometry.computeVertexNormals()

        return { geometry, culled, unculled, materials }
    }

    static translateUV(uv, start, end, animationData) {
        if(animationData && uv == 1) {
            const range = end - start
            return start + range / animationData.frames
        }
        return uv * (end - start) + start
    }

    static getUVs(uvs, [startX, startY, endX, endY]) {
        let newUVs = []
        for(let i = 0; i < uvs.length; i += 2) {
            newUVs.push(this.translateUV(uvs[i], startX, endX))
            newUVs.push(this.translateUV(uvs[i + 1], startY, endY))
        }
        return newUVs
    }

    static autoUVs(from, to, side) {
        if(side == Side.North) return [from[0], from[1], to[0], to[1]]
        if(side == Side.South) return [from[0], from[1], to[0], to[1]]
        if(side == Side.West) return [from[2], from[1], to[2], to[1]]
        if(side == Side.East) return [from[2], from[1], to[2], to[1]]
        if(side == Side.Up) return [from[0], from[2], to[0], to[2]]
        if(side == Side.Down) return [from[0], from[2], to[0], to[2]]

        return [0, 0, 1, 1]
    }
}