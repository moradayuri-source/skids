import { randomUUID } from 'node:crypto';
import { apiResult, getSupabase } from '../config/db.js';

const dateFields = new Set(['createdAt', 'updatedAt', 'lastLoginAt', 'publishedAt', 'date', 'reportDate']);
export const invalidRecord = (message) => Object.assign(new Error(message), { statusCode: 400 });

export const defineRepository = (table, fields, { secretFields = [], normalize = (value) => value, relation = '', hydrate = (value) => value } = {}) => {
  const columns = ['_id', ...fields, 'createdAt', 'updatedAt'];
  const selection = (options = {}) => [
    ...(options.attributes || columns).filter((field) => columns.includes(field) && (options.includePassword || !secretFields.includes(field))),
    ...(relation ? [relation] : []),
  ].join(',');
  const prepare = (values) => {
    const picked = Object.fromEntries(fields.filter((key) => values[key] !== undefined).map((key) => {
      let value = values[key];
      if (typeof value === 'string' && !secretFields.includes(key)) value = value.trim();
      if (dateFields.has(key) && value != null) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) throw invalidRecord('A valid ' + key + ' is required');
        value = date.toISOString();
      }
      return [key, value];
    }));
    return normalize(picked);
  };
  const mapRow = (row, options = {}) => {
    if (!row) return null;
    const record = { ...row };
    for (const key of secretFields) {
      if (!options.includePassword) delete record[key];
      else if (record[key] !== undefined) Object.defineProperty(record, key, { value: record[key], enumerable: false });
    }
    for (const key of dateFields) if (record[key] != null) record[key] = new Date(record[key]);
    return hydrate(record);
  };
  const filter = (query, where = {}) => {
    for (const [key, value] of Object.entries(where)) {
      if (!columns.includes(key)) throw new Error('Unsupported repository filter');
      query = value === null ? query.is(key, null) : query.eq(key, value);
    }
    return query;
  };
  const repository = {
    table, fields, prepare, hydrate: mapRow,
    async findAll(options = {}) {
      const records = [];
      const size = options.limit || 500;
      let offset = options.offset || 0;
      while (true) {
        let query = filter(getSupabase().from(table).select(selection(options), { count: 'exact' }), options.where);
        for (const [field, direction] of options.order || []) query = query.order(field, { ascending: direction !== 'DESC' });
        if (!(options.order || []).some(([field]) => field === '_id')) query = query.order('_id');
        for (const [field, operator, value] of options.filters || []) query = query.filter(field, operator, value);
        const requested = options.limit ? Math.min(size, options.limit - records.length) : size;
        const { data, count } = apiResult(await query.range(offset, offset + requested - 1));
        records.push(...data.map((row) => mapRow(row, options)));
        offset += data.length;
        if (!data.length || (options.limit && records.length >= options.limit)
          || (count != null && offset >= count) || (count == null && data.length < size)) return records;
      }
    },
    async findOne(options = {}) {
      const { data } = apiResult(await filter(getSupabase().from(table).select(selection(options)), options.where).limit(1).maybeSingle());
      return mapRow(data, options);
    },
    findById(id, options = {}) { return repository.findOne({ ...options, where: { _id: id } }); },
    async count(options = {}) {
      const { count } = apiResult(await filter(getSupabase().from(table).select('_id', { count: 'exact', head: true }), options.where));
      return count;
    },
    async create(values) {
      const { data } = apiResult(await getSupabase().from(table).insert({ ...prepare(values), _id: randomUUID() }).select(selection()).single());
      return mapRow(data);
    },
    async updateById(id, values) {
      const { data } = apiResult(await getSupabase().from(table).update({ ...prepare(values), updatedAt: new Date().toISOString() }).eq('_id', id).select(selection()).maybeSingle());
      return mapRow(data);
    },
    async deleteById(id) {
      const { data } = apiResult(await getSupabase().from(table).delete().eq('_id', id).select(selection()).maybeSingle());
      return mapRow(data);
    },
  };
  return repository;
};
