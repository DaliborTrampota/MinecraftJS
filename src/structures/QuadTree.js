import { Vector2 } from 'https://cdn.skypack.dev/three@0.141.0';
import { ChunkSize } from '../tools/Constants';

export default class QuadTree {
    constructor(boundary = new Vector2(ChunkSize, ChunkSize), itemsPerArea){
        this.boundary = boundary
        this.n = itemsPerArea

    }
}


class Rectangle {

}