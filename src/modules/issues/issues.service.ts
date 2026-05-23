import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../../config";
import type { IIssue } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssue, userId: number) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id) VALUES ($1,$2,$3,$4) RETURNING *
    `,
    [title, description, type, userId],
  );
  return result;
};

// Get All Issues
const getAllIssueFromDB = async (query: any) => {
  const { sort = "newest", type, status } = query;

  // Base SQL
  let sql = `
    SELECT *
    FROM issues
  `;

  const conditions: string[] = [];
  const values: any[] = [];

  // Filter by type
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  // Filter by status
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  // Add WHERE clause
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Sorting
  sql += `
    ORDER BY created_at ${sort === "oldest" ? "ASC" : "DESC"}
  `;

  // Get all issues
  const issuesResult = await pool.query(sql, values);

  const issues = issuesResult.rows;

  // Fetch reporter details separately
  const finalIssues = await Promise.all(
    issues.map(async (issue) => {
      const reporterResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE email = $1
        `,
        [issue.reporter_email],
      );

      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,

        reporter: reporterResult.rows[0] || null,

        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
    }),
  );

  return finalIssues;
};

// Single Issue
const getSingleIssueFromDB = async (id: string) => {
  // Find issue
  const issueResult = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE id = $1
    `,
    [id],
  );

  // Issue not found
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // Fetch reporter details separately
  const reporterResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE email = $1
    `,
    [issue.reporter_email],
  );

  const reporter = reporterResult.rows[0] || null;

  // Final response object
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter,

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

// Update Issue
const updateIssueIntoDB = async (
  id: string,
  payload: any,
  decodedToken: JwtPayload,
) => {
  // Find Issue
  const issueResult = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE id = $1
    `,
    [id],
  );

  // Issue Not Found
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // Find Current User
  const userResult = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [decodedToken.email],
  );

  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult.rows[0];

  /**
   * Access Rules
   *
   * Maintainer:
   *   Can update any issue
   *
   * Contributor:
   *   Can update own issue
   *   Only if status is open
   */

  const isMaintainer = user.role === "maintainer";

  const isOwnIssue = issue.reporter_email === user.email;

  const isOpen = issue.status === "open";

  // Permission Check
  if (!isMaintainer) {
    if (!(isOwnIssue && isOpen)) {
      throw new Error("You are not authorized to update this issue");
    }
  }

  // Dynamic Update Fields
  const updates: string[] = [];
  const values: any[] = [];

  let count = 1;

  if (payload.title) {
    updates.push(`title = $${count}`);
    values.push(payload.title);
    count++;
  }

  if (payload.description) {
    updates.push(`description = $${count}`);
    values.push(payload.description);
    count++;
  }

  if (payload.type) {
    updates.push(`type = $${count}`);
    values.push(payload.type);
    count++;
  }

  // updated_at
  updates.push(`updated_at = NOW()`);

  // Issue ID
  values.push(id);

  // Update Query
  const updateQuery = `
    UPDATE issues
    SET ${updates.join(", ")}
    WHERE id = $${count}
    RETURNING *
  `;

  const updatedResult = await pool.query(updateQuery, values);

  return updatedResult.rows[0];
};

// Delete Issue
const deleteIssueFromDB = async (id: string, decodedToken: JwtPayload) => {
  // Find Current User
  const userResult = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [decodedToken.email],
  );

  // User Not Found
  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult.rows[0];

  // Only Maintainer Can Delete
  if (user.role !== "maintainer") {
    throw new Error("Only maintainer can delete issues");
  }

  // Check Issue Exists
  const issueResult = await pool.query(
    `
    SELECT *
    FROM issues
    WHERE id = $1
    `,
    [id],
  );

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  // Delete Issue
  await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1
    `,
    [id],
  );

  return;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};
