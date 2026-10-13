export class MockUsersRepository {
  constructor(initialUsers = null) {
    this.initialUsers = initialUsers || [
      {
        Id: 1,
        Name: 'Habiba Wael',
        Email: 'habiba.wael@example.com',
        Age: 22,
        CreatedAt: '2026-10-13T10:00:00.000Z',
        UpdatedAt: null
      },
      {
        Id: 2,
        Name: 'Alex Johnson',
        Email: 'alex.johnson@example.com',
        Age: 28,
        CreatedAt: '2026-10-13T10:05:00.000Z',
        UpdatedAt: null
      },
      {
        Id: 3,
        Name: 'Sarah Chen',
        Email: 'sarah.chen@example.com',
        Age: 31,
        CreatedAt: '2026-10-13T10:10:00.000Z',
        UpdatedAt: null
      }
    ];
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(this.initialUsers));
    this.nextId = Math.max(...this.users.map((u) => u.Id), 0) + 1;
  }

  async findAll(search = null) {
    if (!search || !String(search).trim()) {
      return this.users.map((u) => ({ ...u }));
    }
    const term = String(search).trim().toLowerCase();
    return this.users
      .filter((u) => u.Name.toLowerCase().includes(term) || u.Email.toLowerCase().includes(term))
      .map((u) => ({ ...u }));
  }

  async findById(id) {
    const user = this.users.find((u) => u.Id === Number(id));
    return user ? { ...user } : null;
  }

  async findByEmail(email) {
    const user = this.users.find((u) => u.Email.toLowerCase() === String(email).toLowerCase());
    return user ? { ...user } : null;
  }

  async create({ name, email, age }) {
    const newUser = {
      Id: this.nextId++,
      Name: name,
      Email: email.toLowerCase(),
      Age: Number(age),
      CreatedAt: new Date().toISOString(),
      UpdatedAt: null
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id, updates) {
    const index = this.users.findIndex((u) => u.Id === Number(id));
    if (index === -1) return null;
    const existing = this.users[index];

    const updated = {
      ...existing,
      ...(updates.name !== undefined && { Name: updates.name }),
      ...(updates.email !== undefined && { Email: updates.email.toLowerCase() }),
      ...(updates.age !== undefined && { Age: Number(updates.age) }),
      UpdatedAt: new Date().toISOString()
    };
    this.users[index] = updated;
    return { ...updated };
  }

  async delete(id) {
    const index = this.users.findIndex((u) => u.Id === Number(id));
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async getStats() {
    const totalUsers = this.users.length;
    const ages = this.users.map((u) => u.Age);
    const sumAge = ages.reduce((acc, a) => acc + a, 0);
    return {
      totalUsers,
      averageAge: totalUsers > 0 ? Math.round((sumAge / totalUsers) * 10) / 10 : 0,
      minAge: totalUsers > 0 ? Math.min(...ages) : 0,
      maxAge: totalUsers > 0 ? Math.max(...ages) : 0
    };
  }
}

