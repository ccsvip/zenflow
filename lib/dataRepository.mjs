import { randomUUID } from 'node:crypto';

import { ensureDatabase, query } from './db.mjs';
import { hashPassword, verifyPassword } from './password.mjs';

const createId = (prefix) => `${prefix}-${randomUUID()}`;

const asText = (value) => (value == null ? '' : String(value));
const asAttachments = (value) => (Array.isArray(value) ? value : []);

const userFromRow = (row) => ({
  id: row.id,
  username: row.username,
  role: row.role,
});

export async function listAllData() {
  const [users, projects, requirements, tasks, bugs] = await Promise.all([
    listUsers(),
    listProjects(),
    listRequirements(),
    listTasks(),
    listBugs(),
  ]);

  return { users, projects, requirements, tasks, bugs };
}

export async function listUsers() {
  const result = await query(
    'SELECT id, username, role FROM users ORDER BY created_at ASC',
  );
  return result.rows.map(userFromRow);
}

export async function loginUser(username, password) {
  await ensureDatabase();
  const result = await query(
    'SELECT id, username, password_hash, role FROM users WHERE username = $1 LIMIT 1',
    [username],
  );
  const user = result.rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  return userFromRow(user);
}

export async function changePassword(userId, oldPassword, newPassword) {
  await ensureDatabase();
  const result = await query(
    'SELECT id, username, password_hash, role FROM users WHERE id = $1 LIMIT 1',
    [userId],
  );
  const user = result.rows[0];

  if (!user || !verifyPassword(oldPassword, user.password_hash)) {
    return null;
  }

  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    hashPassword(newPassword),
    userId,
  ]);

  return userFromRow(user);
}

export async function createUser(data) {
  const id = data.id || createId('U');
  const result = await query(
    `INSERT INTO users (id, username, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, role`,
    [id, data.username, hashPassword(data.password), data.role || 'user'],
  );
  return userFromRow(result.rows[0]);
}

export async function deleteUser(id) {
  const result = await query(
    "DELETE FROM users WHERE id = $1 AND username <> 'root' RETURNING id",
    [id],
  );
  return result.rowCount > 0;
}

export async function listProjects() {
  const result = await query(
    `SELECT id, name, description, status
     FROM projects
     ORDER BY created_at ASC`,
  );
  return result.rows;
}

export async function createProject(data) {
  const id = data.id || createId('P');
  const result = await query(
    `INSERT INTO projects (id, name, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, status`,
    [id, data.name, asText(data.description), data.status || 'planning'],
  );
  return result.rows[0];
}

export async function updateProject(id, data) {
  const result = await query(
    `UPDATE projects
     SET name = $2, description = $3, status = $4
     WHERE id = $1
     RETURNING id, name, description, status`,
    [id, data.name, asText(data.description), data.status || 'planning'],
  );
  return result.rows[0] || null;
}

export async function deleteProject(id) {
  await Promise.all([
    query('DELETE FROM requirements WHERE project_id = $1', [id]),
    query('DELETE FROM tasks WHERE project_id = $1', [id]),
    query('DELETE FROM bugs WHERE project_id = $1', [id]),
  ]);
  await query('DELETE FROM projects WHERE id = $1', [id]);
}

export async function listRequirements() {
  const result = await query(
    `SELECT id, title, description, stakeholder, module, requirement_type AS "requirementType",
            importance, urgency, dev_reply AS "devReply", solution, milestone, result, remark,
            project_id AS "projectId", priority, status, attachments
     FROM requirements
     ORDER BY created_at ASC`,
  );
  return result.rows;
}

export async function createRequirement(data) {
  const id = data.id || createId('R');
  const result = await query(
    `INSERT INTO requirements (
       id, title, description, stakeholder, module, requirement_type, importance, urgency,
       dev_reply, solution, milestone, result, remark, project_id, priority, status, attachments
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING id, title, description, stakeholder, module, requirement_type AS "requirementType",
               importance, urgency, dev_reply AS "devReply", solution, milestone, result, remark,
               project_id AS "projectId", priority, status, attachments`,
    [
      id,
      data.title,
      asText(data.description),
      asText(data.stakeholder),
      asText(data.module),
      asText(data.requirementType),
      asText(data.importance),
      asText(data.urgency),
      asText(data.devReply),
      asText(data.solution),
      asText(data.milestone),
      asText(data.result),
      asText(data.remark),
      data.projectId,
      data.priority || 'medium',
      data.status || 'draft',
      JSON.stringify(asAttachments(data.attachments)),
    ],
  );
  return result.rows[0];
}

export async function updateRequirement(id, data) {
  const result = await query(
    `UPDATE requirements
     SET title = $2, description = $3, stakeholder = $4, module = $5, requirement_type = $6,
         importance = $7, urgency = $8, dev_reply = $9, solution = $10, milestone = $11,
         result = $12, remark = $13, project_id = $14, priority = $15, status = $16, attachments = $17
     WHERE id = $1
     RETURNING id, title, description, stakeholder, module, requirement_type AS "requirementType",
               importance, urgency, dev_reply AS "devReply", solution, milestone, result, remark,
               project_id AS "projectId", priority, status, attachments`,
    [
      id,
      data.title,
      asText(data.description),
      asText(data.stakeholder),
      asText(data.module),
      asText(data.requirementType),
      asText(data.importance),
      asText(data.urgency),
      asText(data.devReply),
      asText(data.solution),
      asText(data.milestone),
      asText(data.result),
      asText(data.remark),
      data.projectId,
      data.priority || 'medium',
      data.status || 'draft',
      JSON.stringify(asAttachments(data.attachments)),
    ],
  );
  return result.rows[0] || null;
}

export async function deleteRequirement(id) {
  await query('DELETE FROM requirements WHERE id = $1', [id]);
}

export async function listTasks() {
  const result = await query(
    `SELECT id, title, description, project_id AS "projectId", priority, assignee, start_date AS "startDate", status
     FROM tasks
     ORDER BY created_at ASC`,
  );
  return result.rows;
}

export async function createTask(data) {
  const id = data.id || createId('T');
  const result = await query(
    `INSERT INTO tasks (id, title, description, project_id, priority, assignee, start_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, description, project_id AS "projectId", priority, assignee, start_date AS "startDate", status`,
    [
      id,
      data.title,
      asText(data.description),
      data.projectId,
      data.priority || 'medium',
      asText(data.assignee),
      asText(data.startDate),
      data.status || 'todo',
    ],
  );
  return result.rows[0];
}

export async function updateTask(id, data) {
  const result = await query(
    `UPDATE tasks
     SET title = $2, description = $3, project_id = $4, priority = $5, assignee = $6, start_date = $7, status = $8
     WHERE id = $1
     RETURNING id, title, description, project_id AS "projectId", priority, assignee, start_date AS "startDate", status`,
    [
      id,
      data.title,
      asText(data.description),
      data.projectId,
      data.priority || 'medium',
      asText(data.assignee),
      asText(data.startDate),
      data.status || 'todo',
    ],
  );
  return result.rows[0] || null;
}

export async function deleteTask(id) {
  await query('DELETE FROM tasks WHERE id = $1', [id]);
}

export async function listBugs() {
  const result = await query(
    `SELECT id, title, project_id AS "projectId", steps, priority, severity, status, assignee, attachments
     FROM bugs
     ORDER BY created_at ASC`,
  );
  return result.rows;
}

export async function createBug(data) {
  const id = data.id || createId('B');
  const result = await query(
    `INSERT INTO bugs (id, title, project_id, steps, priority, severity, status, assignee, attachments)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, title, project_id AS "projectId", steps, priority, severity, status, assignee, attachments`,
    [
      id,
      data.title,
      data.projectId,
      asText(data.steps),
      data.priority || 'high',
      data.severity || 'major',
      data.status || 'open',
      asText(data.assignee),
      JSON.stringify(asAttachments(data.attachments)),
    ],
  );
  return result.rows[0];
}

export async function updateBug(id, data) {
  const result = await query(
    `UPDATE bugs
     SET title = $2, project_id = $3, steps = $4, priority = $5, severity = $6, status = $7, assignee = $8, attachments = $9
     WHERE id = $1
     RETURNING id, title, project_id AS "projectId", steps, priority, severity, status, assignee, attachments`,
    [
      id,
      data.title,
      data.projectId,
      asText(data.steps),
      data.priority || 'high',
      data.severity || 'major',
      data.status || 'open',
      asText(data.assignee),
      JSON.stringify(asAttachments(data.attachments)),
    ],
  );
  return result.rows[0] || null;
}

export async function deleteBug(id) {
  await query('DELETE FROM bugs WHERE id = $1', [id]);
}
