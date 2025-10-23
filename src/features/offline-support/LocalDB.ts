import Dexie from 'dexie';

export const db = new Dexie('OfflineDB');

db.version(1).stores({
    items: '++id, synced',
    orders: '++id, synced'
})