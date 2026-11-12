import { defineRepository } from './repository.js';
export default defineRepository('announcements', ['title', 'content', 'priority', 'author', 'authorName', 'status', 'publishedAt']);
