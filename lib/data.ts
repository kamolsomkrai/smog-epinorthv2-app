import { db } from "./db";
import type { RowDataPacket } from "mysql2";

// --- 1.กำหนด Types ที่จะคืนค่า ---
export type KpiData = {
  diseaseName: string;
  totalCases: number;
  ratePer100k: string;
};

export type ChartData = {
  month: string;
  cases: number;
};

export type TableData = {
  province: string;
  cases: number;
  rate: number;
};

// Type สำหรับ Filter (ตอนนี้ value กับ label คือชื่อเดียวกัน)
export type DiseaseGroup = {
  value: string; // "โรคระบบทางเดินหายใจ"
  label: string; // "โรคระบบทางเดินหายใจ"
};

// --- 2. ฟังก์ชันดึงข้อมูล (เชื่อมตารางใหม่) ---

const CURRENT_YEAR = new Date().getFullYear();

/**
 * ⭐️ ฟังก์ชันใหม่: ดึงรายชื่อกลุ่มโรค (สำหรับ Filter)
 * เราจะดึงรายชื่อกลุ่มโรคที่ไม่ซ้ำกันมาจากตาราง summary โดยตรง
 */
export const getDiseaseGroups = async (): Promise<DiseaseGroup[]> => {
  const query = `
    SELECT DISTINCT 
      groupname AS value, 
      groupname AS label 
    FROM 
      summary_disease_amphur 
    ORDER BY 
      groupname;
  `;
  const [rows] = await db.query<RowDataPacket[]>(query);
  return rows as DiseaseGroup[];
};

/**
 * 🚀 อัปเกรด: ดึง KPI โดย JOIN ตารางประชากร
 */
export const getKpiData = async (diseaseGroup: string): Promise<KpiData> => {
  const query = `
    SELECT
      sda.groupname AS diseaseName,
      SUM(sda.patient_count) AS totalCases,
      (SUM(sda.patient_count) / SUM(pop.population_count)) * 100000 AS ratePer100k
    FROM
      summary_disease_amphur AS sda
    JOIN
      population_data AS pop ON sda.province = pop.province
    WHERE
      sda.groupname = ? 
      AND YEAR(sda.service_date) = ?
      AND pop.year = ?
    GROUP BY
      sda.groupname;
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, [
    diseaseGroup,
    CURRENT_YEAR,
    CURRENT_YEAR,
  ]);

  if (rows.length === 0) {
    // ถ้าไม่มีเคสเลย ก็ยังคืนชื่อกลุ่มโรค
    return { diseaseName: diseaseGroup, totalCases: 0, ratePer100k: "0.00" };
  }

  const data = rows[0];
  return {
    diseaseName: data.diseaseName,
    totalCases: Number(data.totalCases),
    ratePer100k: Number(data.ratePer100k).toFixed(2),
  };
};

/**
 * 🚀 อัปเกรด: กราฟรายเดือน (ใช้ groupname ชื่อเต็ม)
 */
export const getChartData = async (
  diseaseGroup: string
): Promise<ChartData[]> => {
  const query = `
    SELECT
      DATE_FORMAT(service_date, '%b') AS month, -- %b = Jan, Feb, Mar...
      SUM(patient_count) AS cases
    FROM
      summary_disease_amphur
    WHERE
      groupname = ? AND YEAR(service_date) = ?
    GROUP BY
      MONTH(service_date), DATE_FORMAT(service_date, '%b')
    ORDER BY
      MONTH(service_date);
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, [
    diseaseGroup,
    CURRENT_YEAR,
  ]);

  return rows.map((row) => ({
    month: row.month, // คุณอาจจะต้องแปลง Jan -> ม.ค.
    cases: Number(row.cases),
  }));
};

/**
 * 🚀 อัปเกรด: ตารางรายจังหวัด (JOIN ตารางประชากร)
 */
export const getTableData = async (
  diseaseGroup: string
): Promise<TableData[]> => {
  const query = `
    SELECT
      sda.province,
      SUM(sda.patient_count) AS cases,
      (SUM(sda.patient_count) / MAX(pop.population_count)) * 100000 AS rate
    FROM
      summary_disease_amphur AS sda
    JOIN
      population_data AS pop ON sda.province = pop.province
    WHERE
      sda.groupname = ?
      AND YEAR(sda.service_date) = ?
      AND pop.year = ?
    GROUP BY
      sda.province
    ORDER BY
      sda.province;
  `;

  const [rows] = await db.query<RowDataPacket[]>(query, [
    diseaseGroup,
    CURRENT_YEAR,
    CURRENT_YEAR,
  ]);

  return rows.map((row) => ({
    province: row.province,
    cases: Number(row.cases),
    rate: Number(row.rate),
  }));
};
