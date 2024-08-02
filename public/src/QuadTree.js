import { Vector2 } from 'three';
import { WORLD_SETTINGS } from './tools/Constants';

export default class QuadTree {
    constructor(boundary = new Vector2(WORLD_SETTINGS.chunkSize, WORLD_SETTINGS.chunkSize), itemsPerArea){
        this.boundary = boundary
        this.n = itemsPerArea

    }
}


class Rectangle {

}