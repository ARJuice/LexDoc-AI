---
name: skill_db
description: Create, plan, edit, and optimize Supabase PostgreSQL database structures. Use this skill when the user asks to design a database, write migrations, plan data architecture, define relationships, or structure their data layer centering around Supabase features. Generates robust, normalized (up to 3NF), and scalable PostgreSQL designs.
---

This skill guides the planning, creation, and editing of database structures, definitions, and data models specifically tailored for **Supabase PostgreSQL**.

The user will provide database or data-related requirements.

## Database Design Thinking (Supabase-Focused)

Before proposing a schema or writing migrations, analyze the conceptual model and commit to a solid database structure:
- **Supabase Features**: Leverage managed PostgreSQL, storage buckets, RLS (Row Level Security) policies, and hybrid authentication.
- **Relational Schema**: Define clear boundaries and relationships (One-to-One, One-to-Many, Many-to-Many) mapping the domain perfectly into a relational model.
- **Normalization up to 3NF**: 
  - **1NF**: Ensure atomic values and no repeating groups.
  - **2NF**: Ensure no partial dependencies on composite keys.
  - **3NF**: Eliminate transitive dependencies (e.g., store `dept_id` mapped to `departments` instead of `dept_name` in parent table).
- **Triggers & Stored Procedures**: Go beyond tables; use `plpgsql` functions and triggers to automate tasks (e.g., audit logging) and encapsulate business logic directly in the DB.

## Database Guidelines

Focus on:
- **Normalization**: Strictly enforce up to Third Normal Form (3NF).
- **Naming Conventions**: Use `snake_case` for PostgreSQL tables and columns. Name foreign keys clearly.
- **SQL Queries & Data Population**: Provide concrete `CREATE TABLE`, `INSERT`, and sample `SELECT` queries for real-world scenarios.
- **Performance Optimizations**: Add indexes on standard foreign keys or querying columns.
- **Security**: Focus on Row Level Security (RLS) policies using Supabase standard approaches (e.g. comparing specific fields with `auth.uid()`).

## Output Format

Always show the rationale behind your design choices. Structure the output clearly:

1. **Relational Schema & Normalization Check**: Describe the models. Visually map them with a `mermaid` ER Diagram. Explain how the schema achieves 1NF, 2NF, and 3NF.
2. **Schema Definition**: Output the precise PostgreSQL DDL (`CREATE TABLE`).
3. **SQL Queries and Data Population**: Write seed data scripts and sample queries for core app functionality.
4. **Advanced PostgreSQL (Triggers, Procedures, RLS)**: Supply the code for triggers, stored procedures, and security policies that the system relies on.
