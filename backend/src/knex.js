import knexLib from 'knex';
import knexConfig from '../knexfile.js'; // go up one level from src/

const environment = process.env.NODE_ENV || 'development';
const knex = knexLib(knexConfig[environment]);

export default knex;
