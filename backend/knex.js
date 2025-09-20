import knexLib from 'knex';
import config from '../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const knex = knexLib(config[environment]);

export default knex;