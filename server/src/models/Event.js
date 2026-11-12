import { defineRepository } from './repository.js';
export default defineRepository('events', ['title', 'date', 'time', 'location', 'description', 'status', 'createdBy']);
