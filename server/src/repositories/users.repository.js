import { getPool } from '../config/database.js';

export class UsersRepository {
  constructor(poolProvider = getPool) {
    this.poolProvider = poolProvider;
  }

  async _getPool() {
    if (typeof this.poolProvider === 'function') {
      return await this.poolProvider();
    }
    return this.poolProvider;
  }

  /**
   * Retrieves all users from the database, optionally filtered by search query.
   * Parameterized query ensures complete protection against SQL injection.
   */
  async findAll(search = null) {
    const pool = await this._getPool();
    const request = pool.request();

    let sql = `
      SELECT [Id], [Name], [Email], [Age], [CreatedAt], [UpdatedAt]
      FROM [dbo].[Users]
    `;

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      request.input('searchTerm', term);
      sql += ` WHERE [Name] LIKE @searchTerm OR [Email] LIKE @searchTerm`;
    }

    sql += ` ORDER BY [Id] DESC`;

    const result = await request.query(sql);
    return result.recordset || [];
  }

  /**
   * Finds a user by ID.
   */
  async findById(id) {
    const pool = await this._getPool();
    const request = pool.request();
    request.input('id', id);

    const sql = `
      SELECT [Id], [Name], [Email], [Age], [CreatedAt], [UpdatedAt]
      FROM [dbo].[Users]
      WHERE [Id] = @id
    `;

    const result = await request.query(sql);
    return result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Finds a user by email address (case-insensitive in SQL Server collation).
   */
  async findByEmail(email) {
    const pool = await this._getPool();
    const request = pool.request();
    request.input('email', email);

    const sql = `
      SELECT [Id], [Name], [Email], [Age], [CreatedAt], [UpdatedAt]
      FROM [dbo].[Users]
      WHERE [Email] = @email
    `;

    const result = await request.query(sql);
    return result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Creates a new user record.
   */
  async create({ name, email, age }) {
    const pool = await this._getPool();
    const request = pool.request();
    request.input('name', name);
    request.input('email', email);
    request.input('age', age);

    const sql = `
      INSERT INTO [dbo].[Users] ([Name], [Email], [Age], [CreatedAt])
      OUTPUT 
        INSERTED.[Id], 
        INSERTED.[Name], 
        INSERTED.[Email], 
        INSERTED.[Age], 
        INSERTED.[CreatedAt], 
        INSERTED.[UpdatedAt]
      VALUES (@name, @email, @age, SYSUTCDATETIME());
    `;

    const result = await request.query(sql);
    return result.recordset[0];
  }

  /**
   * Updates an existing user record.
   */
  async update(id, updates) {
    const pool = await this._getPool();
    const request = pool.request();
    request.input('id', id);

    const setClauses = [];
    if (updates.name !== undefined) {
      request.input('name', updates.name);
      setClauses.push('[Name] = @name');
    }
    if (updates.email !== undefined) {
      request.input('email', updates.email);
      setClauses.push('[Email] = @email');
    }
    if (updates.age !== undefined) {
      request.input('age', updates.age);
      setClauses.push('[Age] = @age');
    }

    setClauses.push('[UpdatedAt] = SYSUTCDATETIME()');

    const sql = `
      UPDATE [dbo].[Users]
      SET ${setClauses.join(', ')}
      OUTPUT 
        INSERTED.[Id], 
        INSERTED.[Name], 
        INSERTED.[Email], 
        INSERTED.[Age], 
        INSERTED.[CreatedAt], 
        INSERTED.[UpdatedAt]
      WHERE [Id] = @id;
    `;

    const result = await request.query(sql);
    return result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Deletes a user record by ID.
   */
  async delete(id) {
    const pool = await this._getPool();
    const request = pool.request();
    request.input('id', id);

    const sql = `
      DELETE FROM [dbo].[Users]
      WHERE [Id] = @id;
    `;

    const result = await request.query(sql);
    return (result.rowsAffected && result.rowsAffected[0] > 0) || false;
  }

  /**
   * Returns count and statistics.
   */
  async getStats() {
    const pool = await this._getPool();
    const sql = `
      SELECT 
        COUNT(*) AS totalUsers,
        ISNULL(AVG(CAST([Age] AS FLOAT)), 0) AS averageAge,
        ISNULL(MIN([Age]), 0) AS minAge,
        ISNULL(MAX([Age]), 0) AS maxAge
      FROM [dbo].[Users];
    `;

    const result = await pool.request().query(sql);
    const row = result.recordset[0] || {};
    return {
      totalUsers: row.totalUsers || 0,
      averageAge: Math.round((row.averageAge || 0) * 10) / 10,
      minAge: row.minAge || 0,
      maxAge: row.maxAge || 0
    };
  }
}

export const usersRepository = new UsersRepository();

