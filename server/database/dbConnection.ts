import { PrismaClient } from '@prisma/client';

/**
 * =========================================
 * Database Connection Module
 * =========================================
 * Architectural Pattern: Singleton Connection Pool
 * 
 * Centralized singleton instantiation of the Prisma ORM PostgreSQL Client.
 * By instantiating this class exactly once and exporting it, we prevent 
 * the application from exhausting the PostgreSQL max-connection limit 
 * during heavy horizontal scaling or hot reloads.
 * 
 * Automatically broadcasts raw SQL query statements and warnings directly 
 * to the backend stdout logging stream natively for high-visibility debugging.
 */
const prisma = new PrismaClient( {
    log: [ 'query', 'info', 'warn', 'error' ],
} );

export default prisma;
