import { MixedList, EntitySchema } from "typeorm";

type Entity = Function | string | EntitySchema

export {
    Entity,
    MixedList
}