import { Vector2 } from 'three';
import { ChunkSize } from '../tools/Constants';

export default class QuadTree {
    constructor(boundary = new Vector2(ChunkSize, ChunkSize), itemsPerArea){
        this.boundary = boundary
        this.n = itemsPerArea

    }
}


class Rectangle {

}