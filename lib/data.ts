import { db } from "./db";
import type { RowDataPacket } from "mysql2";

// --- Types (เหมือนเดิม) ---
export type KpiData = {
  diseaseName: string;
  totalCases: number;
  ratePer100k: string;
};
export type ChartData = {
  /* ... */
};
export type TableData = {
  /* ... */
};
export type DiseaseGroup = {
  /* ... */
};
export type WeeklyReportData = {
  /* ... */
};
// ... (Types อื่นๆ เหมือนเดิม)

// --- Data Fetching Functions ---

// (getAvailableYears และ getDiseaseGroups เหมือนเดิม)
export const getAvailableYears = async (): Promise<string[]> => {
  const query = `
    SELECT DISTINCT 
      YEAR(service_date) AS year 
    FROM 
      summary_disease_amphur 
    ORDER BY 
      year DESC;
  `;
  const [rows] = await db.query<RowDataPacket[]>(query);
  return rows.map((row) => String(row.year));
};

export const getDiseaseGroups = async (
  year: string
): Promise<DiseaseGroup[]> => {
  const query = `
    SELECT DISTINCT 
      groupname AS value, 
      groupname AS label 
    FROM 
      summary_disease_amphur 
    WHERE 
      YEAR(service_date) = ?
    ORDER BY 
      groupname;
  `;
  const [rows] = await db.query<RowDataPacket[]>(query, [year]);

  return [
    { value: "all", label: "--- รวมทุกกลุ่มโรค ---" },
    ...(rows as DiseaseGroup[]),
  ];
};

/**
 * ⭐️ 1. FIX: แก้ไข Query ของ 'getKpiData'
 */
export const getKpiData = async (
  diseaseGroup: string,
  year: string
): Promise<KpiData> => {
  let diseaseWhereClause = "";
  const params: (string | number)[] = [year];
  if (diseaseGroup !== "all") {
    diseaseWhereClause = " AND sda.groupname = ? ";
    params.push(diseaseGroup);
  }

  // ใช้ Subqueries แยกกันเพื่อหา totalCases และ totalPopulation
  const query = `
    SELECT
      (
        SELECT SUM(sda.patient_count) 
        FROM summary_disease_amphur AS sda
        WHERE YEAR(sda.service_date) = ?
        ${diseaseWhereClause}
      ) AS totalCases,
      (
        SELECT SUM(pop.population_count) 
        FROM population_data AS pop
        WHERE pop.year = ?
      ) AS totalPopulation
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, [
    year,
    ...params.slice(1),
    year,
  ]);
  const data = rows[0];

  let ratePer100k = 0.0;
  if (data && data.totalCases > 0 && data.totalPopulation > 0) {
    ratePer100k =
      (Number(data.totalCases) / Number(data.totalPopulation)) * 100000;
  }

  return {
    diseaseName: diseaseGroup === "all" ? "รวมทุกกลุ่มโรค" : diseaseGroup,
    totalCases: Number(data.totalCases) || 0,
    ratePer100k: ratePer100k.toFixed(2),
  };
};

// (getChartData เหมือนเดิม)
export const getChartData = async (
  diseaseGroup: string,
  year: string
): Promise<ChartData[]> => {
  const params: (string | number)[] = [year];
  let diseaseWhere = "";
  if (diseaseGroup !== "all") {
    diseaseWhere = " AND groupname = ? ";
    params.push(diseaseGroup);
  }

  const query = `
    SELECT
      DATE_FORMAT(service_date, '%b') AS month,
      SUM(patient_count) AS cases
    FROM
      summary_disease_amphur
    WHERE
      YEAR(service_date) = ?
      ${diseaseWhere}
    GROUP BY
      MONTH(service_date), DATE_FORMAT(service_date, '%b')
    ORDER BY
      MONTH(service_date);
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, params);

  return rows.map((row) => ({
    month: row.month,
    cases: Number(row.cases),
  }));
};

/**
 * ⭐️ 2. FIX: แก้ไข Query ของ 'getTableData' (ตารางบน)
 */
export const getTableData = async (
  diseaseGroup: string,
  year: string
): Promise<TableData[]> => {
  const params: (string | number)[] = [year];
  let diseaseWhere = "";
  if (diseaseGroup !== "all") {
    diseaseWhere = " AND groupname = ? ";
    params.push(diseaseGroup);
  }

  // ใช้ Subquery (t1) เพื่อ SUM case ก่อน แล้วค่อย JOIN
  const query = `
    SELECT
      t1.province,
      t1.cases,
      (t1.cases / pop.population_count) * 100000 AS rate
    FROM (
      SELECT
        province,
        SUM(patient_count) AS cases
      FROM
        summary_disease_amphur
      WHERE
        YEAR(service_date) = ?
        ${diseaseWhere}
      GROUP BY
        province
    ) AS t1
    JOIN
      population_data AS pop ON t1.province = pop.province AND pop.year = ?
    ORDER BY
      t1.province;
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, [...params, year]);

  return rows.map((row) => ({
    province: row.province,
    cases: Number(row.cases),
    rate: Number(row.rate),
  }));
};

/**
 * ⭐️ 3. FIX: แก้ไข Query ของ 'getWeeklyProvincialReport'
 */
export const getWeeklyProvincialReport = async (
  diseaseGroup: string,
  year: string
): Promise<WeeklyReportData[]> => {
  const params: (string | number)[] = [year];
  let diseaseWhere = "";
  if (diseaseGroup !== "all") {
    diseaseWhere = " AND groupname = ? ";
    params.push(diseaseGroup);
  }

  // ใช้ Subquery (t1) เพื่อ SUM case ก่อน แล้วค่อย JOIN
  const query = `
    SELECT
      t1.week,
      t1.province,
      t1.groupname,
      t1.patient_count,
      (t1.patient_count / pop.population_count) * 100000 AS rate
    FROM (
      SELECT
        YEARWEEK(service_date, 1) AS week,
        province,
        groupname,
        SUM(patient_count) AS patient_count
      FROM
        summary_disease_amphur
      WHERE
        YEAR(service_date) = ?
        ${diseaseWhere}
      GROUP BY
        week, province, groupname
    ) AS t1
    JOIN
      population_data AS pop ON t1.province = pop.province AND pop.year = ?
    ORDER BY
      t1.week DESC, t1.province ASC, t1.groupname ASC;
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, [...params, year]);

  return rows.map((row) => ({
    week: String(row.week),
    province: row.province,
    groupname: row.groupname,
    patient_count: Number(row.patient_count),
    rate: Number(row.rate),
  }));
};
