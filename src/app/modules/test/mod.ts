import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Module } from '../../types/modules.js'

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string

    @Column()
    description!: string

    @Column()
    viewCount!: number
}

export default {
    data: {
        dbEntities: [Post, 'asdsad'],
        discordIntents: 1,
    },
    onLoad() {
        console.log('Loaded test module')
    },
} as Module
