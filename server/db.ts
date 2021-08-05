import { Pool, QueryResult } from "pg";

const pool = new Pool();

const query = (text: string, params: string[]) => pool.query(text, params);

export default query;
