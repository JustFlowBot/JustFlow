import 'reflect-metadata'
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import { toDir } from '../utils/files.js'
import { Column, DataSource, DataSourceOptions, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Post } from '../modules/test/mod.js'

let databaseOptions = parse(readFileSync(toDir('config/database.yml'), 'utf8')).database as DataSourceOptions
